const { runRemote, upload, getSettings, setSettings, 
    setupSsh: _setupSsh, connectHost, disconnectHost } = require('../ipc')
//import {sleep} from '../../common/util'

const path = require('path')

export default {
    namespaced: true,
    state() {
        return {
            nodes: [],
        }
    },
    getters: {
        getNodes: (state) => state.nodes.filter(n => n.host !=='') || [],
        getNode: (state) => (host) => state.nodes.find(n => n.host === host),
        getNodeSelected: (state) => state.nodes.find(n => n.selected),
    },
    actions: {
        updateNode({commit}, n) { commit('updateNode', n); },
        deselectAllNodes({commit}) { commit('deselectAllNodes'); },
        async disconnectNode({commit}, n) { 
            await disconnectHost(n.host);
            commit('disconnectNode', n); 
        },
        removeNode({commit}, node) { commit('removeNode', node); },
        async loadNode({commit}, node) {
            // os release
            let r = await runRemote('cat /etc/os-release |head -2');
            node.os_release = 'Checking...';
            if (r.rc === 0)
                node.os_release = r.stdout;
            // topology
            r = await runRemote('cd cardano/config && . role.sh && . network.sh && cat ${CARDANO_NODE_NETWORK}-topology-${CARDANO_NODE_ROLE}.json');
            if (r.rc === 0)
                node.topology = JSON.parse(r.stdout);
            else
                console.log(r)
            // tools versions
            r = await runRemote('python3 cardano/bin/cardano.py version');
            node.version = 'Checking...';
            if (r.rc === 0) {
                node.version = JSON.parse(r.stdout);
                node.has_tools = true;
            } else {
                node.has_tools = false;
            }
            commit('updateNode', node);             
        },
        async connectNode({commit, dispatch, getters}, n) {
            commit('workStart', `Connecting to ${n.host}...`, {root: true});
            let r = await connectHost(n.host, n.user, n.password);
            console.log(r);
            if (r.rc === 0) {
              // await sleep(1000);
                await dispatch('updateNodeStatus', n);
                if (n.password) {
                    // setup ssh
                    r = await dispatch('setupSsh', n);
                    n.password = '';                    
                    n.ssh_auth = false;
              } else {
                  n.ssh_auth = true;
              }             
              // persist list of nodes
              let arr = JSON.parse(JSON.stringify(getters.getNodes));
              arr.forEach(n => n.connected=false);
              setSettings('nodes', arr);
              n.selected = true;
              n.connected = true;
              commit('updateNode', n);  
              setSettings('current_node', n.host);
              r.stdout = `Connected to ${n.host}`;
            } else {
                //r.stdout = '';
            }
            commit('workEnd', r, {root: true});              
            //console.log('loading:', getters.getLoading);
            return new Promise(res => {res(r)});
            
        },
        async setupSsh({commit}, n) {
            commit('setMessage', 'Setting up ssh keys...', {root: true});          
            let r = await _setupSsh(n.host, n.user, n.password);
            if (r.rc === 0) {
                n.ssh_auth = 1;
                commit('setMessage','Ssh keys ok.', {root: true});
            } else {
                r.stderr = "Ssh keys setup failed: "+ r.stderr;  
                console.log(n.error);
                //const sleep = ms => new Promise(res => setTimeout(res, ms));
            }
            return r;
        },
        async updateNodeStatus({commit}, n) { 
            // get node status from ssh
            //let r = await runRemote(n.host, 'hostname;uptime;free -m;df -H /');
            let r = await runRemote('python3 cardano/bin/status.py');
            if (r.rc === 0) {
                if (r.stdout)
                    n.status = JSON.parse(r.stdout);
            } else {
                console.log('error getting node status: '+ r.stderr);                    
                n.status = r.stderr;
            }
            commit('updateNode', n); 
            // peers
            r = await runRemote('python3 cardano/bin/cardano.py peers');
            if (r.rc === 0) {
                if (r.stdout)
                    n.peers = JSON.parse(r.stdout);
            } else {
                console.log('error getting node peers: '+ r.stderr);                    
                //n.status = r.stderr;
            }
            commit('updateNode', n); 
        },
        async installNode({commit}, {node, sudo}) {
            commit('workStart', 'Installing cardano-node...', {root: true});   
            let r = null;
            let src = null;
            let dst = null;

            // upload files
            r = await runRemote('mkdir -p cardano/bin cardano/config');
            if (r.rc !== 0) {
                commit('workEnd', r.stderr, {root: true});
                commit('updateNode', node);
                return r; 
            }

            let appPath = getSettings('appPath');
            
            src = path.join(appPath,'tool','bin');
            dst = 'cardano/bin'; 
            // src = appPath+'\\tool\\bin\\install.sh';
            // dst = 'cardano/bin/install.sh'; 
            console.log('src:', src);
            console.log('dst:', dst);
            r = await upload(src, dst);
            console.log(r);
            if (r.rc !== 0) {
                commit('workEnd', r.stderr, {root: true});
                commit('updateNode', node);
                return r; 
            }
            src = path.join(appPath,'tool','config');
            dst = 'cardano/config'; 
            console.log('uploading src:', src);
            console.log('dst:', dst);
            r = await upload(src, dst);
            console.log(r);
            if (r.rc !== 0) {
                commit('workEnd', r.stderr, {root: true});
                commit('updateNode', node);
                return r; 
            }            
            let prompt = [
                {
                    question: 'password',
                    answer: sudo,
                }
            ];
            
            r = await runRemote('sudo bash cardano/bin/install.sh',
                    prompt, true);
            console.log(r);
            if (r.rc !== 0) {
                commit('workEnd', r.stderr, {root: true});
                commit('updateNode', node);
                return r; 
            }
            r.stdout = 'cardano-node installed.'
            commit('workEnd', r, {root: true});
            commit('updateNode', node);
            return r;
        },
        async serviceAction({commit, dispatch}, s) {
            commit('workStart', `Service: ${s.action} ${s.service}...`, {root: true});
            let r = await runRemote(`sudo /bin/systemctl ${s.action} ${s.service}`);
            if (r.rc !== 0) {
                console.log(r);
            } else {
                await dispatch('updateNodeStatus', s.node);
                commit('updateNode', s.node);
                r.stdout = 'Success!';
            }
            commit('workEnd',r, {root: true});
        },
        async changeRole({commit}, n) {
            commit('workStart', 'Changing role...', {root: true});
            let r = await runRemote('cardano/bin/change_role.sh');
            if (r.rc !== 0) {
                console.log(r);
            } else {
                commit('updateNode', n);
                r.stdout = 'Success! New role will be available after node service restart.';
            }
            console.log(r);
            commit('workEnd',r, {root: true});
        },
        async updateTopology({commit}, {node, topology}) {
            commit('workStart', 'Saving topology...', {root: true});
            let topology_str = JSON.stringify(topology, null, 2);
            let r = await runRemote(`echo '${topology_str}' > cardano/config/testnet-topology-relay.json`);
            if (r.rc !== 0) {
                console.log(r);
            } else {
                node.topology = topology;
                commit('updateNode', node);
                r.stdout = 'Topology updated.';
            }
            commit('workEnd',r, {root: true});
            return r;
        },
                
    },

    mutations: {
        updateNode(state, node) {
            //console.log('updating1: '+ JSON.stringify(node));            
            //const index = state.nodes.findIndex(n => n.ip === node.ip);
            const n = state.nodes.find(n => n.host === node.host);
            let current_node = null;
            if (n) {
                Object.assign(n, node);
                current_node = n;
            } else {
                state.nodes.push(node);
                current_node = node;
            }
            // update current node
            if (current_node.selected) {
                setSettings('current_node', current_node.host);
            }
        },
        deselectAllNodes(state) {
            state.nodes.forEach(n => n.selected = false);
        },
        disconnectNode(state, node) {
            const n = state.nodes.find(n => n.host === node.host);
            if (n) {
                n.connected = false;
            }
        },       
        removeNode(state, node) {
            const i = state.nodes.findIndex(n => n.host === node.host);
            if (i > -1) {
                state.nodes[i].connected = false;
                state.nodes.splice(i,1)
            }
        },              
    },
}
