<template>
  <div class="container p-5">
    <h1>Connect</h1>
    <form @submit.prevent="onSubmit">
      <div class="form-group ">
        <input id="hostname" v-model="dat.host" placeholder="Hostname or IP" 
          class="form-control" required />  
      </div>
      <div class="form-group top10">
        <input id="username" type="text" v-model="dat.user" placeholder="User name" 
          class="form-control" required />  
      </div>
      <div class="form-group top10">
        <input id="password" v-model="dat.password" type="password" 
          placeholder="Password" v-if="need_password" class="form-control"/>  
      </div>
      <div class="form-group top10">
        <input value="Connect" type="submit" class="btn btn-primary"
          :disabled="loading"/>  
      </div>
    </form>
    <br/>
    </div>
    <Error :message="error" />
    <div>{{message}}</div>
    <!-- <div><pre>{{dat}}</pre></div> -->
</template>

<script>
import {ref} from 'vue';
import Error from "./Error"
import Loading from "./Loading"
import {getSettings, setSettings, connectHost} from "../ipc"
import {MUT} from '@/common/constants'
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';

export default {
  components : { Error, Loading },
  setup() {

    const dat = ref({
      host : getSettings('hostname', 'localhost'),
      user : getSettings('username'),
      password : '',
    });
    const error = ref('');
    const loading = ref(false);
    const message = ref('')
    const need_password = ref(false);
    const store = useStore();
    const router = useRouter();

    async function onSubmit() {
      loading.value = true;     
      let host = dat.value.host;
      let user = dat.value.user;
      let pass = dat.value.password;
      error.value = ''
      need_password.value = false;
      message.value = `Connecting to ${host}...`;
      
      let r = await connectHost(host, user, pass);
      if (r.stderr ===  '' && r.rc === 0) {
        message.value = `Connected to ${host}: ${r.stdout}`;
        dat.value.password = '';
        store.commit(MUT.UPDATE_NODE, {name: host, ip: host, role: "", connected: true});   
        //console.log(store.state.nodes);
        // persist list of nodes
        //setSettings('nodes', JSON.parse(JSON.stringify(store.state.nodes)));
        
        //window.ipc.send(IPC.NOTIFY, 'Connected', message.value);
       
        // test ssh keys and generate if needed

        router.push(`/nodes/${host}`);

      } else {
        error.value = r.stderr;
        message.value = '';
        if (r.stderr.includes('Authentication')) {
          need_password.value = true;
        }
      }        
      this.loading = false;
      setSettings('hostname', host);
      setSettings('username', user);
    }
    
    
    return {
      dat,onSubmit,error,loading,message,need_password
    };
  },

  
  props: ['host'],
  emits: ['submit'],
  // methods: {
  //   connect: function (e) {
  //     e.preventDefault();
  //     this.$parent.connectHost(this.hostname);
  //   },
   
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
.top10 { margin-top:10px; }
</style>
