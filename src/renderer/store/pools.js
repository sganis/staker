import {
    runRemote, upload, getSettings, setSettings, 
    setupSsh, connectHost, disconnectHost } from '../ipc'

const path = require('path')

export default {
    namespaced: true,
    state() {
        return {
            pools: [],
            loading : false,
            error: '',
            message: '',
        }
    },
    getters: {
        getPools: (state) => state.pools.filter(n => n.name !=='') || [],
        getPool: (state) => (name) => state.pools.find(n => n.name === name),
        getPoolSelected: (state) => state.pools.find(n => n.selected),
        getLoading:(state)=> state.loading,
        getError:(state)=> state.error,
        getMessage:(state)=> state.message,
    },
    actions: {
        updatePool({commit}, n) { commit('updatePool', n); },
        deselectAllPools({commit}) { commit('deselectAllPools'); },
        async disconnectPool({commit}, n) { 
            await disconnectHost(n.name);
            commit('disconnectPool', n); 
        },
        removePool({commit}, n) { commit('removePool', n); },
        async updatePoolStatus({commit}, n) { 
            // get pool status from ssh
            //let r = await runRemote(n.host, 'hostname;uptime;free -m;df -H /');
            let r = await runRemote('python3 cardano/bin/status.py');
            if (r.rc === 0) {
                if (r.stdout)
                    n.status = JSON.parse(r.stdout);
            } else {
                console.log('error getting pool status: '+ r.stderr);                    
                n.status = r.stderr;
            }
            // update state
            commit('updatePool', n); 
        },
    },

    mutations: {
        updatePool(state, pool) {
            //console.log('updating1: '+ JSON.stringify(pool));            
            //const index = state.pools.findIndex(n => n.ip === pool.ip);
            const n = state.pools.find(n => n.host === pool.host);
            let current_pool = null;
            if (n) {
                Object.assign(n, pool);
                current_pool = n;
            } else {
                state.pools.push(pool);
                current_pool = pool;
            }
            // update current pool
            if (current_pool.selected) {
                setSettings('current_pool', current_pool.host);
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
                setTimeout(()=> state.message = '', 5000);
            } else {
                state.error = '';
                state.message = '';
            }
        },
        
    },
}
