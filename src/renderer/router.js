import {createRouter, createWebHistory} from 'vue-router'
import Home from './components/Home'
import Nodes from './components/Nodes'
import Explorer from './components/Explorer'
import Settings from './components/Settings'

const routes = [
  { path: '/', component: Home },
  { name: 'nodes', path: '/nodes/:id?', component: Nodes },
  { name: 'explorer', path: '/explorer', component: Explorer },
  { name: 'settings', path: '/settings', component: Settings },
  
]
  
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
