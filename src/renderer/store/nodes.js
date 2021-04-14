import {
    runRemote, upload, getSettings, setSettings, 
    setupSsh, connectHost } from '../ipc'
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
            wallets: [],
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
        disconnectNode({commit}, n) { commit('disconnectNode', n); },
        removeNode({commit}, n) { commit('removeNode', n); },
        async hasTools({commit}, n) { 
            if (n) {
                let r = await runRemote('ls .staker');
                n.has_tools = r.rc === 0;
                commit('updateNode', n); 
            }
        },
        async connectNode({commit, getters}, n) {
            commit('setLoading', true);     
            commit('setError', '');     
            commit('setMessage', `Connecting to ${n.host}...`);     
            let r = await connectHost(n.host, n.user, n.password);
            console.log(r);
            if (r.rc === 0) {
              commit('setMessage', `Connected to ${n.host}: ${r.stdout}`);
              await sleep(1000);
            
              if (n.password) {
                n.password = '';
                // setup ssh
                commit('setMessage', 'Setting up ssh keys...');          
                r = await setupSsh(n.host, n.user);
                await sleep(1000);
                if (r.rc === 0) {
                    commit('setMessage','Ssh keys ok.');
                } else {
                    commit('setLoading',false);
                    commit('setMessage','');
                    commit('setError',"Ssh keys setup failed: "+ r.stderr);  
                    console.log(n.error);
                    //const sleep = ms => new Promise(res => setTimeout(res, ms));
                }
                await sleep(1000);
                
              } 
              n.selected = true;
              n.connected = true;
              commit('updateNode', n);   
              
              // persist list of nodes
              let arr = JSON.parse(JSON.stringify(getters.getNodes));
              arr.forEach(n => n.connected=false);
              setSettings('nodes', arr);
              setSettings('current_node', this.host);
            } else {
                commit('setError',r.stderr);
                commit('setMessage', '');
            }
            commit('setLoading',false);
            console.log('loading:', getters.getLoading);
            return new Promise(res => {res(r)});
            
        },
        async updateNodeStatus({commit}, n) { 
            // get node status from ssh
            //let r = await runRemote(n.host, 'hostname;uptime;free -m;df -H /');
            let r = await runRemote('python3 .staker/status.py');
            if (r.rc === 0) {
                n.status = JSON.parse(r.stdout);
            } else {
                n.status = r.stderr;
            }
            // update state
            commit('updateNode', n); 
        },
        async setupNode({commit}, n) {
            let r = await runRemote('mkdir -p .staker');
            if (r.rc !== 0) {
                n.status = r.stderr;
                commit('updateNode', n);
                return; 
            }
            
            let appPath = getSettings('appPath');
            let src = path.join(appPath,'tool');
            let dst = '.staker'; 
            console.log('src:', src);

            r = await upload(src, dst);
            if (r.rc === 0) {
                n.status = r.stdout;
            } else {
                n.status = r.stderr;
            }
            commit('updateNode', n);
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
    },
}