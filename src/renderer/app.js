import {createApp} from 'vue'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import App from '@/components/App.vue'
import router from "@/renderer/router"
import store from '@/renderer/store'


createApp(App)
    .use(router)
    .use(store)
    .mount('#app')

