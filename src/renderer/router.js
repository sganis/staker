import {createRouter, createWebHistory} from 'vue-router'
import Home from '@/components/Home'
import Host from '@/components/Host'

const routes = [
  { path: '/', component: Home },
  { path: '/host', component: Host }
]
  
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
