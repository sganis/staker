import {
    runRemote, upload, getSettings, setSettings, 
    setupSsh, connectHost, disconnectHost } from '../ipc'

const path = require('path')
const axios = require('axios');

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
            let r = await runRemote('cat cardano/config/pool.json 2>/dev/null');
            if (r.rc === 0)
                pool = JSON.parse(r.stdout);
            
            //console.log(pool);
            // pool id
            r = await runRemote('cardano/bin/cardano-cli stake-pool id --cold-verification-key-file cardano/keys/cold.vkey --output-format "hex"');
            if (r.rc === 0) {
                if (r.stdout)
                    pool.id = r.stdout;
            } else {
                console.log('error getting pool metadata: '+ r.stderr);                    
            }
            // load keys
            await dispatch('loadKeys', pool);

            // metadata json
            r = await runRemote('[ -f cardano/config/pool-metadata.json ] && cat cardano/config/pool-metadata.json');
            if (r.rc === 0) {
                if (r.stdout)
                    pool.metadata = JSON.parse(r.stdout);
            } else {
                console.log('error getting pool metadata: '+ r.stderr);                    
            }
            // hash
            await dispatch('computeMetadataHash', pool);

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
        async computeMetadataHash({commit}, pool) {
            let r = await runRemote('cardano/bin/cardano-cli stake-pool metadata-hash --pool-metadata-file cardano/config/pool-metadata.json');
            if (r.rc === 0) {
                if (r.stdout)
                    pool.metadata_hash = r.stdout.trim();
            } else {
                console.log('error computing pool metadata hash: '+ r.stderr);                    
            }            
        },
        async checkMetadataUrl({commit}, pool) {
            console.log('getting url: '+pool.metadata_url);
            try {
                let r = await axios.get('https://git.io/JmApG')
                console.log(r.data);
            } catch (error) {
                console.log(error);
            }                        
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
        async updateMetadata({commit, dispatch}, {pool, metadata, url}) {
            commit('workStart', 'Saving metadata...', {root: true});
            let metadata_json = JSON.stringify(metadata, null, 2);
            let r = await runRemote(`echo '${metadata_json}' > cardano/config/pool-metadata.json`);
            if (r.rc !== 0) {
                console.log(r);
            } else {
                pool.metadata = metadata;
                pool.metadata_url = url;
                dispatch('computeMetadataHash', pool);
                dispatch('checkMetadataUrl', pool);                
                let r = await dispatch('savePool', pool);
                if (r.rc === 0) {
                    r.stdout = 'Metadata updated.';
                }
            }
            commit('workEnd',r, {root: true});
            return r;
        },
        async updateRelayNodes({commit, dispatch}, {pool, relay_nodes}) {
            commit('workStart', 'Updating relay nodes...', {root: true});
            pool.relay_nodes = relay_nodes;
            let r = await dispatch('savePool', pool);
            if (r.rc === 0) {
                r.stdout = 'Relay nodes updated.';
            }
            commit('workEnd',r, {root: true});
            return r;
        },
        async savePool({commit}, pool) {
            let pool_json = JSON.stringify(pool, null, 2);
            let r = await runRemote(`echo '${pool_json}' > cardano/config/pool.json`);
            if (r.rc===0) {
                commit('updatePool', pool);
            } else {
                console.log('error saving pool: '+ r.stderr);
            }
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
            const p = state.pools.find(x => x.name === pool.name);
            let current_pool = null;
            if (p) {
                Object.assign(p, pool);
                current_pool = p;
            } else {
                if (pool.name) {
                    state.pools.push(pool);
                    current_pool = pool;
                }
            }
            if (current_pool && current_pool.selected) {
                setSettings('current_pool', current_pool.name);
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
