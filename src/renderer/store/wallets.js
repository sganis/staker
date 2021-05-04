import { runRemote } from '../ipc'
const axios = require('axios');

export default {
    namespaced: true,
    state() {
        return {
            wallets: [],
            addressed: [],
        }
    },
    getters: {
        getWallets: (state) => state.wallets.filter(n => n.name !=='') || [],
        getWallet: (state) => (name) => state.wallets.find(n => n.name === name),
        getWalletSelected: (state) => state.wallets.find(n => n.selected),  
    },
    actions: {
        update({commit}, w) { commit('update', w); },
        deselectAll({commit}) { commit('deselectAll'); },
        async delete({commit}, w) { 
            commit('workStart', 'Deleting wallet...', {root: true});            
            let cmd = `cardano/bin/cardano-wallet wallet delete ${w.id}`;
            let r = await runRemote(cmd);
            if (r.rc === 0) {
                r.stderr = '';
                r.stdout = 'Wallet deleted.'
            }
            commit('delete', w); 
            commit('workEnd', r, {root: true});   
            console.log(r);         
        },
        async rename({commit}, w) { 
            commit('workStart', 'Renaming wallet...', {root: true});            
            let cmd = `cardano/bin/cardano-wallet wallet update name ${w.id} "${w.newname}"`;
            let r = await runRemote(cmd);
            console.log(r);
            if (r.rc === 0) {
                w.name = w.newname;
                r.stderr = '';
                r.stdout = 'Wallet name updated.'
            }
            commit('update', w); 
            commit('workEnd', r, {root: true});   
            console.log(r);         
        },
        async updatePass({commit}, w) { 
            console.log('updating pass:',w)
            commit('workStart', 'Updating passphrase in wallet...', {root: true});            
            let cmd = `cardano/bin/cardano-wallet wallet update passphrase ${w.id}`;
            console.log(cmd);
            let prompt = [
                { question: 'your current passphrase:',
                  answer: w.currentpass,    },
                { question:'enter a new passphrase:',
                  answer: w.newpass1,         },
                { question: 'the passphrase a second time:',
                  answer: w.newpass2, },
            ];
            let r = await runRemote(cmd, prompt);
            console.log(r);
            if (r.rc === 0) {
                r.stderr = '';
                r.stdout = 'Wallet passphrase updated.'
            }
            commit('workEnd', r, {root: true});   
            console.log(r);         
        },
        async transaction({commit}, w) { 
            console.log('making transaction:',w)
            commit('workStart', 'Making transaction...', {root: true});            
            let cmd = `cardano/bin/cardano-wallet transaction create ${w.id} `;
            cmd += `--payment ${w.amount * 1000000}@${w.toaddr}`;
            console.log(cmd);
            let prompt = [
                { question: 'enter your passphrase:',
                  answer: w.txpass, },                
            ];
            let r = await runRemote(cmd, prompt);
            console.log(r);
            if (r.rc === 0) {
                r.stderr = '';
                r.stdout = 'Transaction sent.'
            }
            commit('workEnd', r, {root: true});   
            console.log(r);         
        },
        async loadAll({commit}) {
            let cmd = 'cardano/bin/cardano-wallet wallet list';
            let r = await runRemote(cmd);
            if (r.rc ===0 ) {
                JSON.parse(r.stdout.trim()).forEach(async (w) => {
                    commit('update', w);
                });
            }            
        },
        async load({commit, dispatch}, w) {
            let cmd = `cardano/bin/cardano-wallet wallet get ${w.id}`;
            let r = await runRemote(cmd);
            // console.log(r);
            if (r.rc === 0) {
                w = JSON.parse(r.stdout.trim())
                cmd = `cardano/bin/cardano-wallet address list ${w.id}`;
                r = await runRemote(cmd);
                w.addresses = JSON.parse(r.stdout.trim());
                cmd = `cardano/bin/cardano-wallet transaction list ${w.id}`;
                r = await runRemote(cmd);
                w.transactions = JSON.parse(r.stdout.trim());
                commit('update', w); 
                dispatch('getAdaUsd', w);
            }
            // get stake address
            let stake_addr = '';
            r = await runRemote(`[ -f cardano/wallets/${w.id}/stake.addr ] && cat cardano/wallets/${w.id}/stake.addr`)
            
            if (r.stdout) {
                stake_addr = r.stdout;
                r = await runRemote(`python3 cardano/bin/cardano.py stake-address-info --address ${stake_addr}`);
                //console.log(r);
                if (r.rc === 0) {
                    let js = JSON.parse(r.stdout);
                    if (js.length > 0) {
                        w.stake_address = js[0];
                    } else {
                        w.stake_address = "Not registered";
                    }
                } 
            } else {
                w.stake_address = 'N/A';
            }
        },
        async getAdaUsd({commit}, w) {
            try {
                let response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd')
                //console.log(response);
                w.usd = response.data.cardano.usd;
                commit('update', w);                 
            }
            catch(error) {
                console.log(error);
            }            
        },
        async create({commit,dispatch}, w) {
            commit('workStart', 'Creating wallet...', {root: true});
            let r = {};
            let cmd = '';
            let prompt = [];
            let words = w.words;            
            if (!w.use_words) {
                cmd = 'cardano/bin/cardano-wallet recovery-phrase generate --size 24';
                r = await runRemote(cmd);
                words = r.stdout.trim();
            }
            cmd = `cardano/bin/cardano-wallet wallet create from-recovery-phrase "${w.name}"`;
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
                w.id = JSON.parse(r.stdout.trim()).id;
                console.log('new id: '+ w.id);
                r.stderr = '';
                // extract pool keys
                r = await runRemote(`mkdir -p cardano/wallets/${w.id}; cd cardano/wallets/${w.id}; echo ${words} > words.prv; ../../bin/extract_keys.sh words.prv`);
                if (r.rc != 0) {
                    console.log(r);
                }
                
                if(!w.use_words)
                    r.newwords = words;
                commit('update', w);
                //dispatch('load', w);   
            }
            commit('workEnd', r, {root: true});
            return new Promise(res=>{res(r)});
        },                   
    },

    mutations: {
        deselectAll(state) {state.wallets.forEach(n => n.selected = false); },
        delete(state, wallet) {
            const i = state.wallets.findIndex(n => n.id === wallet.id);
            if (i > -1) {
                state.wallets.splice(i,1)
            }
        },       
        update(state, wallet) {
            const w = state.wallets.find(n => n.id === wallet.id);
            if (w) {
                Object.assign(w, wallet);
            } else {
                state.wallets.push(wallet);
            }
        },       
    },
}

