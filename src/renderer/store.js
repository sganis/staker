import {createStore} from 'vuex'
import {
    runRemote, upload, getSettings, setSettings, 
    setupSsh, connectHost } from './ipc'
import {sleep} from '../common/util'

const path = require('path')

const store = createStore({
    state() {
        return {
            nodes: [],
            loading : false,
            error: '',
            message: '',
            wallets: [],
        }
    },
    getters: {
        // nodes
        getNodes: (state) => state.nodes.filter(n => n.host !=='') || [],
        getNode: (state) => (host) => state.nodes.find(n => n.host === host),
        getNodeSelected: (state) => state.nodes.find(n => n.selected),
        getLoading:(state)=> state.loading,
        getError:(state)=> state.error,
        getMessage:(state)=> state.message,
          
        // wallets
        getWallets: (state) => state.wallets.filter(n => n.name !=='') || [],
        getWallet: (state) => (name) => state.wallets.find(n => n.name === name),
        getWalletSelected: (state) => state.wallets.find(n => n.selected),  
    },
    actions: {
        // nodes
        updateNode({commit}, n) { commit('updateNode', n); },
        deselectAllNodes({commit}) { commit('deselectAllNodes'); },
        disconnectNode({commit}, n) { commit('disconnectNode', n); },
        removeNode({commit}, n) { commit('removeNode', n); },
        async hasTools({commit}, n) { 
            if (n) {
                let r = await runRemote('ls .staker');
                n.has_tools = r.rc === 0;
                commit('updateNode', n); 
            }
        },
        async connectNode({commit, getters}, n) {
            commit('setLoading', true);     
            commit('setError', '');     
            commit('setMessage', `Connecting to ${n.host}...`);     
            let r = await connectHost(n.host, n.user, n.password);
            console.log(r);
            if (r.rc === 0) {
              commit('setMessage', `Connected to ${n.host}: ${r.stdout}`);
              await sleep(2000);
            
              if (n.password) {
                n.password = '';
                // setup ssh
                commit('setMessage', 'Setting up ssh keys...');          
                r = await setupSsh(n.host, n.user);
                await sleep(2000);
                if (r.rc === 0) {
                    commit('setMessage','Ssh keys ok.');
                } else {
                    commit('setLoading',false);
                    commit('setMessage','');
                    commit('setError',"Ssh keys setup failed: "+ r.stderr);  
                    console.log(n.error);
                    //const sleep = ms => new Promise(res => setTimeout(res, ms));
                }
                await sleep(2000);
                
              } 
              n.selected = true;
              n.connected = true;
              commit('updateNode', n);   
              
              // persist list of nodes
              let arr = JSON.parse(JSON.stringify(getters.getNodes));
              arr.forEach(n => n.connected=false);
              setSettings('nodes', arr);
              setSettings('current_node', this.host);
            } else {
                commit('setError',r.stderr);
                commit('setMessage', '');
            }
            commit('setLoading',false);
            console.log('loading:', getters.getLoading);
            return new Promise(res => {res(r)});
            
        },
        async updateNodeStatus({commit}, n) { 
            // get node status from ssh
            //let r = await runRemote(n.host, 'hostname;uptime;free -m;df -H /');
            let r = await runRemote('python3 .staker/status.py');
            if (r.rc === 0) {
                n.status = JSON.parse(r.stdout);
            } else {
                n.status = r.stderr;
            }
            // update state
            commit('updateNode', n); 
        },
        async setupNode({commit}, n) {
            let r = await runRemote('mkdir -p .staker');
            if (r.rc !== 0) {
                n.status = r.stderr;
                commit('updateNode', n);
                return; 
            }
            
            let appPath = getSettings('appPath');
            let src = path.join(appPath,'tool');
            let dst = '.staker'; 
            console.log('src:', src);

            r = await upload(src, dst);
            if (r.rc === 0) {
                n.status = r.stdout;
            } else {
                n.status = r.stderr;
            }
            commit('updateNode', n);
        },

        // wallets
        updateWallet({commit}, n) { commit('updateWallet', n); },
        deselectAllWallets({commit}) { commit('deselectAllWallets'); },
        removeWallet({commit}, n) { 
            // todo, async deletion of address and keys    
            commit('removeWallet', n); 
        },
        async loadWallets({commit}) {
            let cmd = 'python3 .staker/cardano.py address --list';
            let r = await runRemote(cmd);
            if (r.stderr)
                console.log(r.stderr);
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
        updateNode(state, node) {
            //console.log('updating1: '+ JSON.stringify(node));            
            //const index = state.nodes.findIndex(n => n.ip === node.ip);
            const n = state.nodes.find(n => n.host === node.host);
            let current_node = null;
            if (n) {
                Object.assign(n, node);
                current_node = n;
            } else {
                state.nodes.push(node);
                current_node = node;
            }
            // update current node
            if (current_node.selected) {
                setSettings('current_node', current_node.host);
            }
        },
        deselectAllNodes(state) {
            state.nodes.forEach(n => n.selected = false);
        },
        disconnectNode(state, node) {
            const n = state.nodes.find(n => n.host === node.host);
            if (n) {
                n.connected = false;
            }
        },       
        // setupNode(state, node) {
        //     const n = state.nodes.find(n => n.host === node.host);
        //     if (n) {
        //         n.connected = false;
        //     }
        // },       
        removeNode(state, node) {
            const i = state.nodes.findIndex(n => n.host === node.host);
            if (i > -1) {
                state.nodes[i].connected = false;
                state.nodes.splice(i,1)
            }
        },       
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
});

export default store;