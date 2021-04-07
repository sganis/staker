import {createStore} from 'vuex'
import {runRemote, upload, getSettings} from './ipc'
const path = require('path')

const store = createStore({
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
        disconnectNode({commit}, n) { commit('disconnectNode', n); },
        removeNode({commit}, n) { commit('removeNode', n); },
        async hasTools({commit}, n) { 
            let r = await runRemote(n.host, 'ls .staker');
            n.has_tools = r.rc === 0;
            commit('updateNode', n); 
        },

        async updateNodeStatus({commit}, n) { 
            // get node status from ssh
            //let r = await runRemote(n.host, 'hostname;uptime;free -m;df -H /');
            let r = await runRemote(n.host, 'python3 .staker/status.py');
            if (r.rc === 0) {
                n.status = JSON.parse(r.stdout);
            } else {
                n.status = r.stderr;
            }
            // update state
            commit('updateNode', n); 
        },
        async setupNode({commit}, n) {

    

            let r = await runRemote(n.host, 'mkdir -p .staker');
            if (r.rc !== 0) {
                n.status = r.stderr;
                commit('updateNode', n);
                return; 
            }
            
            let appPath = getSettings('appPath');
            let src = path.join(appPath,'resources/scripts/status.py');
            let dst = '.staker/status.py'; 
            console.log('src:', src);

            r = await upload(n.host, src, dst);
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
            if (n) {
                //state.nodes.splice(index, 1, node);
                //console.log('updating2: '+ JSON.stringify(node));
                //n = {...n, ...props};
                Object.assign(n, node);
                //console.log('nodes: '+ JSON.stringify(state.nodes));                
            } else {
                state.nodes.push(node);
                //console.log('node added: '+ JSON.stringify(node));
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
        // setupNode(state, node) {
        //     const n = state.nodes.find(n => n.host === node.host);
        //     if (n) {
        //         n.connected = false;
        //     }
        // },       
        removeNode(state, node) {
            const i = state.nodes.findIndex(n => n.host === node.host);
            if (i > -1) {
                state.nodes[i].connected = false;
                state.nodes.splice(i,1)
            }
        },       
    },
});

export default store;