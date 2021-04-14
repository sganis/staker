import {createStore} from 'vuex'
import nodes from './nodes';
import wallets from './wallets';

const store = createStore({
    modules: {
        nodes: nodes,
        wallets: wallets,
    },
    state() {
        return {
        }
    },
    getters: {
    },
    actions: {
     },

    mutations: {
    },
 });

export default store;