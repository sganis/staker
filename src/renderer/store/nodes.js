import {
    runRemote, upload, getSettings, setSettings, 
    setupSsh, connectHost, disconnectHost } from '../ipc'
import {sleep} from '../../common/util'

const path = require('path')

export default {
    namespaced: true,
    state() {
        return {
            nodes: [],
            loading : false,
            error: '',
            message: '',
        }
    },
    getters: {
        getNodes: (state) => state.nodes.filter(n => n.host !=='') || [],
        getNode: (state) => (host) => state.nodes.find(n => n.host === host),
        getNodeSelected: (state) => state.nodes.find(n => n.selected),
        getLoading:(state)=> state.loading,
        getError:(state)=> state.error,
        getMessage:(state)=> state.message,
    },
    actions: {
        updateNode({commit}, n) { commit('updateNode', n); },
        deselectAllNodes({commit}) { commit('deselectAllNodes'); },
        async disconnectNode({commit}, n) { 
            await disconnectHost(n.host);
            commit('disconnectNode', n); 
        },
        removeNode({commit}, n) { commit('removeNode', n); },
        async hasTools({commit}, n) { 
            if (n) {
                let r = await runRemote('ls cardano/bin/status.py');
                n.has_tools = r.rc === 0;
                commit('updateNode', n); 
            }
        },
        async connectNode({commit, getters}, n) {
            commit('workStart', `Connecting to ${n.host}...`);
            let r = await connectHost(n.host, n.user, n.password);
            console.log(r);
            if (r.rc === 0) {
              // await sleep(1000);
            
              if (n.password) {
                // setup ssh
                commit('setMessage', 'Setting up ssh keys...');          
                r = await setupSsh(n.host, n.user, n.password);
                n.password = '';
                //await sleep(1000);
                if (r.rc === 0) {
                    commit('setMessage','Ssh keys ok.');
                } else {
                    r.stderr = "Ssh keys setup failed: "+ r.stderr;  
                    console.log(n.error);
                    //const sleep = ms => new Promise(res => setTimeout(res, ms));
                }
                //await sleep(1000);
                
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
            commit('workEnd', r);              
            //console.log('loading:', getters.getLoading);
            return new Promise(res => {res(r)});
            
        },
        async updateNodeStatus({commit}, n) { 
            // get node status from ssh
            //let r = await runRemote(n.host, 'hostname;uptime;free -m;df -H /');
            let r = await runRemote('python3 cardano/bin/status.py');
            if (r.rc === 0) {
                n.status = JSON.parse(r.stdout);
            } else {
                console.log('error getting node status: '+ r.stderr);
                    
                n.status = r.stderr;
            }
            // update state
            commit('updateNode', n); 
        },
        async setupNode({commit}, n) {
            commit('workStart', 'Uploading tools...');   
            let r = await runRemote('mkdir -p cardano/bin');
            if (r.rc !== 0) {
                commit('workEnd', r.stderr);
                commit('updateNode', n);
                return; 
            }
            
            let appPath = getSettings('appPath');
            let src = path.join(appPath,'tool','bin');
            let dst = 'cardano/bin'; 
            console.log('uploading src:', src);
            console.log('dst:', dst);

            r = await upload(src, dst);
            await sleep(1000);

            if (r.rc === 0) {
                n.status = r.stdout;
                r.stdout = 'Tools installed.'
            } else {
                n.status = r.stderr;
            }
            commit('updateNode', n);
            commit('workEnd', r);
        },
        async serviceAction({commit, dispatch}, s) {
            commit('workStart', `Service: ${s.action} ${s.service}...`);
            let r = await runRemote(`sudo /bin/systemctl ${s.action} ${s.service}`);
            if (r.rc !== 0) {
                console.log(r);
            } else {
                await dispatch('updateNodeStatus', s.node);
                // if (s.action === 'stop') {
                //     if (s.service === 'cardano-node')
                //         s.node.status.node_status = 2;
                //     else if (s.service === 'cardano-wallet')
                //         s.node.status.wallet_status = 2;
                // } else if (s.action === 'start') {
                //     if (s.service === 'cardano-node')
                //     s.node.status.node_status = 1;
                // else if (s.service === 'cardano-wallet')
                //     s.node.status.wallet_status = 1;
                // }
                commit('updateNode', s.node);
                r.stdout = 'Success!';
            }
            commit('workEnd',r);
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
        
        setLoading(state, b) { state.loading = b; },
        setError(state, e) {state.error = e; setTimeout(()=> state.error = '', 3000)},
        setMessage(state, m) {state.message = m},
        workStart(state, msg) {
            state.loading = true;
            state.error = '';
            state.message = msg;
        },
        workEnd(state, r={}) {
            state.loading = false;
            if (r.stderr) {
                state.message = '';
                state.error = r.stderr; 
                setTimeout(()=> state.error = '', 3000);
            }
            else if (r.stdout) {
                state.error = '';
                state.message = r.stdout; 
                setTimeout(()=> state.message = '', 1000);
            } else {
                state.error = '';
                state.message = '';
            }
        },
        
    },
}
