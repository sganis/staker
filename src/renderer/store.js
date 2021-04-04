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
        getNodeByIp: (state) => (ip) => {
            return state.nodes.find(nodes => nodes.ip === ip);
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
            }
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