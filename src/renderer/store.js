import { nextTick } from 'vue-demi';
import {createStore} from 'vuex'
import {runRemote} from './ipc'

const store = createStore({
    state() {
        return {
            nodes: [],
        }
    },
    getters: {
        getNodes: (state) => state.nodes.filter(n => n.host !== ''),
        getNode: (state) => (host) => state.nodes.find(n => n.host === host),
        getNodeSelected: (state) => state.nodes.find(n => n.selected),  
    },
    actions: {
        updateNode({commit}, n) { commit('updateNode', n); },
        deselectAllNodes({commit}) { commit('deselectAllNodes'); },
        disconnectNode({commit}, n) { commit('disconnectNode', n); },
        async updateNodeStatus({commit}, n) { 
            // get node status from ssh
            let r = await runRemote(n.host, 'hostname;uptime;free -m;df -H /');
            if (r.rc === 0) {
                n.status = r.stdout;
            } else {
                n.status = r.stderr;
            }
            // update state
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
                //n.connection.disconect();
                //n.connection = null;
                n.connected = false;
            }
        },       
    },
});

export default store;