import {createRouter, createWebHistory} from 'vue-router'
import Home from './view/Home'
import Nodes from './view/nodes/Nodes'
import Wallets from './view/wallets/Wallets'
import Explorer from './view/Explorer'
import Settings from './view/Settings'

const routes = [
  { path: '/', component: Home },
  { name: 'nodes', path: '/nodes/:id?', component: Nodes },
  { name: 'wallets', path: '/wallets/:id?', component: Wallets },
  { name: 'explorer', path: '/explorer', component: Explorer },
  { name: 'settings', path: '/settings', component: Settings },
  
]
  
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
