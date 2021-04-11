<template>
  <div>
    <h1>Connect</h1>
    <div class="vld-parent">
      <form @submit.prevent="onSubmit">
      <div class="form-group ">
        <input id="hostname" v-model="host" placeholder="Hostname or IP" 
          class="form-control" required />  
      </div>
      <div class="form-group top10">
        <input id="username" type="text" v-model="user" placeholder="User name" 
          class="form-control" required />  
      </div>
      <div class="form-group top10">
        <input id="password" v-model="password" type="password" 
          placeholder="Password" v-if="need_password" class="form-control"
          :disabled="loading" />  
      </div>
      <div class="form-group top10">
        <input value="Connect" type="submit" class="btn btn-primary btn-width"
          :disabled="loading"/>  
      </div>
      </form>
      <br/>
      <Spinner :message="message" :loading="loading" />
      <Error :message="error" />
      <div v-if="!loading">{{message}}</div>
    </div>
  </div>
</template>

<script>
import Error from "./Error"
import Spinner from "./Spinner"
import {getSettings, setSettings, connectHost, setupSsh} from "../ipc"
import { mapActions } from 'vuex'
import {sleep} from '../../common/util'

export default {
  components : { Error, Spinner },
  props: ['node'],
  data() {
    return {
      host: (this.node && this.node.host) || '',
      user: (this.node && this.node.user) || getSettings('username'),
      password: '',
      need_password: false,
      loading: false,
      error: '',
      message: '',
    }
  },
  watch: {
    node(newNode) {
      this.host = newNode && newNode.host || '';
      this.user = newNode && newNode.user || getSettings('username');
    },
  },
  methods: {
    ...mapActions(['updateNode']),

    onSubmit: async function() {
      this.loading = true;     
      this.error = ''
      //this.need_password = false;
      this.message = `Connecting to ${this.host}...`;
      console.log(this.host, this.user);
      let r = await connectHost(this.host, this.user, this.password);
      if (r.rc === 0) {
        this.message = `Connected to ${this.host}: ${r.stdout}`;
        if (this.password) {
          this.password = '';
          // setup ssh
          this.message = 'Setting up ssh keys...';          
          r = await setupSsh(this.host, this.user);
          if (r.rc === 0) {
            this.message = 'Ssh keys ok.';          
            console.log(this.message);
            
          } else {
            this.loading = false;
            this.message = '';
            this.error = "Ssh keys setup failed."  
            console.log(this.error);
            //const sleep = ms => new Promise(res => setTimeout(res, ms));
            await sleep(5000);
          }
        } 

        this.updateNode({
          host: this.host, 
          user: this.user, 
          role: "", 
          selected: true,
          connected: true,
        });   
        
        //console.log(store.state.nodes);
        // persist list of nodes
        let arr = JSON.parse(JSON.stringify(this.$store.state.nodes));
        arr.forEach(n => n.connected=false);
        setSettings('nodes', arr);
        setSettings('current_node', this.host);
        //window.ipc.send(IPC.NOTIFY, 'Connected', message.value);
      } else {
        this.error = r.stderr;
        this.message = '';
        if (r.stderr.includes('Authentication')) {
          this.need_password = true;
        }
      }        
      this.loading = false;
      setSettings('hostname', this.host);
      setSettings('username', this.user);
    },
    
    
  },

  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
</style>
