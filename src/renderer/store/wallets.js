import {createStore} from 'vuex'
import {
    runRemote, upload, getSettings, setSettings, 
    setupSsh, connectHost } from '../ipc'
import {sleep} from '../../common/util'

const path = require('path')

export default {
    namespaced: true,
    state() {
        return {
            loading : false,
            error: '',
            message: '',
            wallets: [],
        }
    },
    getters: {
        getWallets: (state) => state.wallets.filter(n => n.name !=='') || [],
        getWallet: (state) => (name) => state.wallets.find(n => n.name === name),
        getWalletSelected: (state) => state.wallets.find(n => n.selected),  
    },
    actions: {
        updateWallet({commit}, n) { commit('updateWallet', n); },
        deselectAllWallets({commit}) { commit('deselectAllWallets'); },
        removeWallet({commit}, n) { 
            // todo, async deletion of address and keys    
            commit('removeWallet', n); 
        },
        async loadWallets({commit}) {
            let cmd = 'python3 .staker/cardano.py address --list';
            let r = await runRemote(cmd);
            console.log(r);
            let wallets = [];
            JSON.parse(r.stdout.trim()).forEach(w => {
                wallets.push(w);
            });
            console.log(wallets);
            commit('loadWallet', wallets);
        },
        async createWallet({commit}, name) {
            let cmd = `mkdir -p .staker/keys; python3 .staker/cardano.py address --name ${name}`;
            let r = await runRemote(cmd);
            return new Promise(resolve => {
                let w = {name: name};
                if (r.rc === 0) {
                    w.address = r.stdout.trim();
                    commit('updateWallet', w);
                }
                resolve(r);
            });              
        }, 
        async getBalance({commit}, name) {
            let cmd = `python3 .staker/cardano.py balance --name ${name}`;
            let r = await runRemote(cmd);
            let w = {name: name};
            if (r.rc === 0) {   
                w.balance = r.stdout.trim();
                console.log('balance :', w.balance);
                commit('updateWallet', w);
            } else {
                console.log(r.stderr);
            }
        }                    
    },

    mutations: {
        setLoading(state, b) { state.loading = b; },
        setError(state, e) {state.error = e; setTimeout(()=> state.error = '', 3000)},
        setMessage(state, m) {state.message = m},

        // wallets
        deselectAllWallets(state) {state.wallets.forEach(n => n.selected = false); },
        loadWallet(state, wallets) {
            state.wallets = [];
            wallets.forEach(w => { state.wallets.push(w); });
        },
        removeWallet(state, wallet) {
            const i = state.wallets.findIndex(n => n.name === wallet.name);
            if (i > -1) {
                state.wallets.splice(i,1)
            }
        },       
        updateWallet(state, wallet) {
            const n = state.wallets.find(n => n.name === wallet.name);
            if (n) {
                Object.assign(n, wallet);
            } else {
                state.wallets.push(wallet);
            }
        },
    },
}

