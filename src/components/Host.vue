<template>
  <div>
    <h1>Host</h1>
    <form novalidate @submit.prevent="onSubmit">
      <div class="form-group ">
        <input id="hostname" v-model="dat.host" placeholder="Hostname or IP" 
          class="form-control"/>  
      </div>
      <div class="form-group top10">
        <input id="hostname" v-model="dat.user" placeholder="User name" 
          class="form-control"/>  
      </div>
      <div class="form-group top10">
        <input value="Connect" type="submit" class="btn btn-primary"
          :disabled="loading"/>  
      </div>
    </form>
    <br/>
    </div>
    <Error :message="error" />
    <Loading :loading="loading" :message="message"/>
    <div><pre>{{dat}} {{loading}}</pre></div>
</template>

<script>
import {ref} from 'vue';
import Error from "@/components/Error"
import Loading from "@/components/Loading"
import {connectHost} from "@/renderer/ipc"
import {getSettings, setSettings} from "@/renderer/ipc"


export default {
  components : { Error, Loading },
  setup() {
    const dat = ref({
      host : getSettings('hostname', 'localhost'),
      user : getSettings('username')
    });
    const error = ref('');
    const loading = ref(false);
    const message = ref('')

    function onSubmit() {
      loading.value = true;     
      message.value = `Connecting to ${dat.value.host}...`;
      connectHost(dat.value.host, dat.value.user).then((r)  => {
        console.log(r)
        
        if (r.stderr === '' && r.rc === 0) {
          message.value = r.stdout;
        } else {
          error.value = r.stderr;
        }
        this.loading = false;
        setSettings('hostname', dat.value.host);
        setSettings('username', dat.value.user);
        
      });
    }

    return {
      dat, onSubmit,error,loading,message
    };
  },

  props: ['host'],
  emits: ['submit'],
  methods: {
    connect: function (e) {
      e.preventDefault();
      this.$parent.connectHost(this.hostname);
    },
   
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
.top10 { margin-top:10px; }
</style>
