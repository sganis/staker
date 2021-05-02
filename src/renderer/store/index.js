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
            loading : false,
            error: '',
            message: '',
        }
    },
    getters: {
        getLoading:(state)=> state.loading,
        getError:(state)=> state.error,
        getMessage:(state)=> state.message,
    },
    actions: {

    },
    mutations: {
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
                setTimeout(()=> state.error = '', 5000);
            }
            else if (r.stdout) {
                state.error = '';
                state.message = r.stdout; 
                setTimeout(()=> state.message = '', 2000);
            } else {
                state.error = '';
                state.message = '';
            }
        },

    },
 });

export default store;