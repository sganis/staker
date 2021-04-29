import {createRouter, createWebHistory} from 'vue-router'
import Home from './view/Home'
import Nodes from './view/nodes/Nodes'
import Wallets from './view/wallets/Wallets'
import Pools from './view/pools/Pools'

const routes = [
  { path: '/', component: Home },
  { name: 'nodes', path: '/nodes/:id?', component: Nodes },
  { name: 'wallets', path: '/wallets/:id?', component: Wallets },
  { name: 'pools', path: '/pools/:id?', component: Pools },
  
]
  
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
