import {createStore} from 'vuex'
//import setSettings from "@/renderer/ipc"

const store = createStore({
    state() {
        return {
            nodes: []
        }
    },
    getters: {
        // getNodesByIp(state) {
        //     return function (ip) {
        //         return state.nodes.find(nodes => nodes.ip === ip);
        //     }
        // },
        getNodeByIp: (state) => (ip) => state.nodes.find(nodes => nodes.ip === ip)
    },
    mutations: {
        setNodes(state, nodes) {
            state.nodes = nodes;  
            //window.ipc.sendSync(IPC.SET_SETTINGS, 'nodes', nodes);          
            //setSettings('nodes', nodes);
        },
        addNode(state, node) {
            if (!(state.nodes.find(n => n.ip === node.ip)))
                state.nodes.push(node);
            //console.log('store updated');
        }
    },
    actions: {
        // fetchData({commit}) {
        //     axios.get('/api/nodes')
        //     .then(r => commit('setNodes', r.nodes));
        // },
        // register({commit}, user) {
        //     axios.get('/api/nodes', user)
        //     .then(r => commit('setUser', r.data));
        // },
    }
});

export default store;