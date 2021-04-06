<template>
  <div>
    <h1>Connect</h1>
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
import Error from "./Error"
import Loading from "./Loading"
import {getSettings, setSettings, connectHost} from "../ipc"
import { mapActions } from 'vuex'


export default {
  components : { Error, Loading },
  props: ['node'],
  data() {
    return {
      host: (this.node && this.node.ip) || '',
      user: getSettings('username'),
      password: '',
      need_password: false,
      loading: false,
      error: '',
      message: '',
    }
  },
  watch: {
    node(newNode,oldNode) {
      this.host = newNode && newNode.ip || '';
    },
  },
  mounted() {
    //this.host = this.node.ip;
  },
  methods: {
    ...mapActions(['updateNode']),
    onSubmit: async function() {
      this.loading = true;     
      this.error = ''
      this.need_password = false;
      this.message = `Connecting to ${this.host}...`;
      console.log(this.host, this.user);
      let r = await connectHost(this.host, this.user, this.password);
      if (r.stderr ===  '' && r.rc === 0) {
        this.message = `Connected to ${this.host}: ${r.stdout}`;
        this.password = '';
        this.updateNode({
          name: this.host, 
          ip: this.host, 
          role: "", 
          selected: true,
          connected: true,
          connection: r.object,
        });   
        //console.log(store.state.nodes);
        // persist list of nodes
        let arr = JSON.parse(JSON.stringify(this.$store.state.nodes));
        arr.forEach(n => n.connected=false);
        setSettings('nodes', arr);
        
        //window.ipc.send(IPC.NOTIFY, 'Connected', message.value);
       
        // test ssh keys and generate if needed

        //this.$router.push(`/nodes/${this.host}`);

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
.top10 { margin-top:10px; }
</style>
