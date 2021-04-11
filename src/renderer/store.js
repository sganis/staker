import {createStore} from 'vuex'
import {runRemote, upload, getSettings, setSettings} from './ipc'
const path = require('path')

const store = createStore({
    state() {
        return {
            nodes: [],
            wallets: [],
        }
    },
    getters: {
        // nodes
        getNodes: (state) => state.nodes.filter(n => n.host !=='') || [],
        getNode: (state) => (host) => state.nodes.find(n => n.host === host),
        getNodeSelected: (state) => state.nodes.find(n => n.selected),  
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
            let r = await runRemote('ls *_paymt.addr');
            if (r.stderr)
                console.log(r.stderr);
            let wallets = [];
            r.stdout.split('\n').forEach(line => {
                wallets.push({name: line.trim().replace('_paymt.addr','')});
            });
            console.log(wallets);
            commit('loadWallet', wallets);
        },
        async createWallet({commit}, name) {
            let cmd = `python3 .staker/cardano.py address --name ${name}`;
            let r = await runRemote(cmd);
            return new Promise(resolve => {
                let w = {name: name};
                if (r.rc === 0) {
                    commit('updateWallet', w);
                }
                resolve(r);
            });              
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