import {
    runRemote, upload, getSettings, setSettings, 
    setupSsh, connectHost, disconnectHost } from '../ipc'

const path = require('path')

export default {
    namespaced: true,
    state() {
        return {
            pools: [],
        }
    },
    getters: {
        getPools: (state) => state.pools.filter(n => n.name !=='') || [],
        getPool: (state) => (name) => state.pools.find(n => n.name === name),
        getPoolSelected: (state) => state.pools.find(n => n.selected),
    },
    actions: {
        updatePool({commit}, pool) { commit('updatePool', pool); },
        deselectAllPools({commit}) { commit('deselectAllPools'); },
        async loadKeys({commit}, pool) {
            let r = await runRemote('python3 cardano/bin/cardano.py pool-keys');
            if (r.rc === 0) {
                pool.keys = JSON.parse(r.stdout);                
                commit('updatePool', pool); 
            } else {
                console.log('error getting pool keys: '+ r.stderr);                    
            }            
        },
        async loadPool({commit, dispatch}, pool) { 
            // pool id
            let r = await runRemote('cardano-cli stake-pool id --cold-verification-key-file cardano/keys/cold.vkey --output-format "hex"');
            if (r.rc === 0) {
                if (r.stdout)
                    pool.id = r.stdout;
            } else {
                console.log('error getting pool metadata: '+ r.stderr);                    
            }
            // load keys
            await dispatch('loadKeys', pool);

            // metadata
            r = await runRemote('[ -f cardano/config/pool-metadata.json ] && cat cardano/config/pool-metadata.json');
            if (r.rc === 0) {
                if (r.stdout)
                    pool.metadata = JSON.parse(r.stdout);
            } else {
                console.log('error getting pool metadata: '+ r.stderr);                    
            }
            r = await runRemote('cardano/bin/cardano-cli stake-pool metadata-hash --pool-metadata-file cardano/config/pool-metadata.json');
            if (r.rc === 0) {
                if (r.stdout)
                    pool.metadata_hash = r.stdout.trim();
            } else {
                console.log('error getting pool metadata: '+ r.stderr);                    
            }
            r = await runRemote('[ -f cardano/config/pool-metadata.url ] && cat cardano/config/pool-metadata.url');
            if (r.rc === 0) {
                if (r.stdout)
                    pool.metadata_url = r.stdout;
            } else {
                console.log('error getting pool metadata url: '+ r.stderr);                    
            }
            // on-chain data
            r = await runRemote(`python3 cardano/bin/cardano.py pool-params --pool-id ${pool.id}`);
            if (r.rc === 0) {
                if (r.stdout) {
                    pool.params = JSON.parse(r.stdout);
                }
            } else {
                console.log('error getting pool params: '+ r.stderr);                    
            }
            // stake snapshot, not used
            // r = await runRemote(`python3 cardano/bin/cardano.py stake-snapshot --pool-id ${pool.id}`);
            // if (r.rc === 0) {
            //     if (r.stdout)
            //         pool.stake_snapshot = JSON.parse(r.stdout);
            // } else {
            //     console.log('error getting stake snapshot: '+ r.stderr);                    
            // }
            //console.log(pool);
            commit('updatePool', pool); 

        },
        async newKey({commit, dispatch}, {pool, type}) {
            commit('workStart', `Generateing new ${type} keys...`, {root: true});
            
            let r = await runRemote(`python3 cardano/bin/cardano.py generate-pool-keys --type=${type.join(',')}`);
            if (r.rc !== 0) {
                console.log(r);
            } else {
                await dispatch('loadKeys', pool);
                r.stdout = 'Success!';
            }
            commit('workEnd',r, {root: true});
            return r;
        },
        async register({commit}, pool) { 
            commit('workStart', 'Registering pool...', {root: true});            
            let r = await runRemote(`python3 cardano/bin/cardano.py register-pool --pledge ${pool.pledge} --margin ${pool.margin} --cost ${pool.cost} --wallet-id ${pool.wallet_id}`);
            if (r.rc === 0) {
                console.log(r);   
            } else {
                console.log('error getting pool metadata: '+ r.stderr);                    
            }
            commit('workEnd', r, {root: true});
            return new Promise(res=>{res(r)});
        }
    },

    mutations: {
        updatePool(state, pool) {
            const p = state.pools.find(x => x.id === pool.id);
            let current_pool = null;
            if (p) {
                Object.assign(p, pool);
                current_pool = p;
            } else {
                state.pools.push(pool);
                current_pool = pool;
            }
            if (current_pool.selected) {
                setSettings('current_pool', current_pool.id);
            }
        },

        deselectAllPools(state) {
            state.pools.forEach(n => n.selected = false);
        },
        
        removePool(state, pool) {
            const i = state.pools.findIndex(n => n.host === pool.host);
            if (i > -1) {
                state.pools[i].connected = false;
                state.pools.splice(i,1)
            }
        },              
    },
}