import {createStore} from 'vuex'

const store = createStore({
    state() {
        return {
            nodes: []
        }
    },
    getters: {
        getNodes: (state) => () =>  state.nodes.filter(n => n.host !== ''),
        getNode: (state) => (host) => state.nodes.find(n => n.host === host),
        getNodeSelected: (state) => () => state.nodes.find(n => n.selected),
    },
    actions: {
        updateNode({commit}, obj) { commit('updateNode', obj); },
        deselectAllNodes({commit}) { commit('deselectAllNodes'); },
        disconnectNode({commit}, obj) { commit('disconnectNode', obj); },
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