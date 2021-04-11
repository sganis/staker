import {createApp} from 'vue'
import App from './components/App.vue'
import router from "./router"
import store from './store'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
//import 'vue-loading-overlay/dist/vue-loading.css';


createApp(App)
    .use(router)
    .use(store)
    .mount('#app')

