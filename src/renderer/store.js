import {createStore} from 'vuex'
import {Vue} from 'vue'
import {MUT,ACT} from "../common/constants"

const store = createStore({
    state() {
        return {
            nodes: []
        }
    },
    getters: {
        getNodes: (state) => () => {
            return state.nodes.filter(n => n.ip !== '');
        },
        getNode: (state) => (ip) => {
            return state.nodes.find(n => n.ip === ip);
        },
        getNodeSelected: (state) => () => {
            return state.nodes.find(n => n.selected);
        }
    },
    mutations: {
        [MUT.SET_NODES](state, nodes) {
            //state.nodes = nodes;  // problem! this removes reactivity
            //state.nodes.concat(nodes);
            console.log('before: '+ nodes);
            //Vue.set(nodes, 'nodes', [...nodes]);
            state.nodes.concat(nodes);
            console.log('after concatenation: '+state.nodes)
            //window.ipc.sendSync(IPC.SET_SETTINGS, 'nodes', nodes);          
            //setSettings('nodes', nodes);
        },
        [MUT.ADD_NODE](state, node) {
            if (!(state.nodes.find(n => n.ip === node.ip)))
                state.nodes.push(node);
            //console.log('store updated');
        },
        [MUT.UPDATE_NODE](state, node) {
            let n = state.nodes.find(n => n.ip === node.ip);
            if (!n) {
                state.nodes.push(node);
            } else {
                n.connected = node.connected;
                n.connection = node.connection;
            }
            //console.log('store updated');
        },
        updateNode(state, node) {
            //console.log('updating1: '+ JSON.stringify(node));            
            //const index = state.nodes.findIndex(n => n.ip === node.ip);
            const n = state.nodes.find(n => n.ip === node.ip);
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
            const n = state.nodes.find(n => n.ip === node.ip);
            if (n) {
                //n.connection.disconect();
                //n.connection = null;
                n.connected = false;
            }
        },
        
    },
    actions: {
        updateNode({commit}, obj) { commit('updateNode', obj); },
        deselectAllNodes({commit}) { commit('deselectAllNodes'); },
        disconnectNode({commit}, obj) { commit('disconnectNode', obj); },
    }
});

export default store;