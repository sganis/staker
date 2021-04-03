import {createApp} from 'vue'
import App from '@/components/App.vue'
import router from "@/renderer/router"
import store from '@/renderer/store'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";


createApp(App)
    .use(router)
    .use(store)
    .mount('#app')

