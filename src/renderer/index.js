import {createApp} from 'vue'
import App from './view/App.vue'
import router from "./router"
import store from './store'
import "bootstrap/dist/css/bootstrap.min.css";
import { BootstrapIconsPlugin } from 'bootstrap-icons-vue';

createApp(App)
    .use(router)
    .use(store)
    .use(BootstrapIconsPlugin)
    .mount('#app')

