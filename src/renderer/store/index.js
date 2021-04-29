import {createStore} from 'vuex'
import nodes from './nodes';
import wallets from './wallets';
import pools from './pools';

const store = createStore({
    modules: {
        nodes: nodes,
        wallets: wallets,
        pools: pools,
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