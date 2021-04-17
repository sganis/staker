import {
    runRemote, getSettings, setSettings } from '../ipc'
// import {sleep} from '../../common/util'
const path = require('path')

export default {
    namespaced: true,
    state() {
        return {
            loading : false,
            error: '',
            message: '',
            wallets: [],
            addressed: [],
        }
    },
    getters: {
        getWallets: (state) => state.wallets.filter(n => n.name !=='') || [],
        getWallet: (state) => (name) => state.wallets.find(n => n.name === name),
        getWalletSelected: (state) => state.wallets.find(n => n.selected),  
        getLoading:(state)=> state.loading,
        getError:(state)=> state.error,
        getMessage:(state)=> state.message,

    },
    actions: {
        updateWallet({commit}, w) { commit('updateWallet', w); },
        deselectAllWallets({commit}) { commit('deselectAllWallets'); },
        removeWallet({commit}, w) { 
            // todo, async deletion of address and keys    
            commit('removeWallet', w); 
        },
        async loadWallets({commit}) {
            let cmd = 'cardano-wallet wallet list';
            let r = await runRemote(cmd);
            console.log(r);
            let wallets = [];
            JSON.parse(r.stdout.trim()).forEach(async (w) => {
                cmd = `cardano-wallet address list ${w.id}`;
                r = await runRemote(cmd);
                w.addresses = JSON.parse(r.stdout.trim());
                commit('updateWallet', w);
            });
            console.log(wallets);
            
        },
        async loadWallet({commit}, w) {
            let cmd = `cardano-wallet wallet get ${w.id}`;
            let r = await runRemote(cmd);
            console.log(r);
            w = JSON.parse(r.stdout.trim())
            cmd = `cardano-wallet address list ${w.id}`;
            r = await runRemote(cmd);
            w.addresses = JSON.parse(r.stdout.trim());
            commit('updateWallet', w);            
        },
        async createWallet({commit,dispatch}, w) {
            commit('workStart', 'Creating wallet...');
            let r = {};
            let cmd = '';
            let prompt = [];
            let words = w.words;            
            if (!w.use_words) {
                cmd = 'cardano-wallet recovery-phrase generate --size 24';
                r = await runRemote(cmd);
                words = r.stdout.trim();
            }
            cmd = `cardano-wallet wallet create from-recovery-phrase "${w.name}"`;
            prompt = [
                { question: '15–24 word recovery phrase:',
                answer: words,    },
                { question:'9–12 word second factor:',
                answer: '',         },
                { question: 'enter a passphrase:',
                answer: w.password, },
                { question: 'passphrase a second time:',
                answer: w.password,  },
            ];
            r = await runRemote(cmd, prompt);
            console.log(r)
            if (r.rc !==0) {
                if (r.stderr.includes('I already know of a wallet with this id'))
                    r.stderr = 'These words will produce an already available wallet';
            } else {
                r.stderr = '';
                dispatch('loadWallets');   
            }
            commit('workEnd', r);
            return new Promise(res=>{res(r)});
        },                   
    },

    mutations: {
        deselectAllWallets(state) {state.wallets.forEach(n => n.selected = false); },
        removeWallet(state, wallet) {
            const i = state.wallets.findIndex(n => n.name === wallet.name);
            if (i > -1) {
                state.wallets.splice(i,1)
            }
        },       
        updateWallet(state, wallet) {
            const w = state.wallets.find(n => n.id === wallet.id);
            if (w) {
                Object.assign(w, wallet);
            } else {
                state.wallets.push(wallet);
            }
        },
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
            if (r && r.stderr) {
                state.error = r.stderr; 
                //setTimeout(()=> state.error = '', 3000);
            }
            else if (r && r.stdout) {
                state.message = r.stdout; 
                setTimeout(()=> state.message = '', 3000);
            }
        },
        
    },
}

