<template>
  <div>
    <h1>Connect</h1>
    <div class="vld-parent">
      <form @submit.prevent="onSubmit">
      <div class="form-group ">
        <input id="hostname" v-model="host" placeholder="Hostname or IP" 
          class="form-control" required :disabled="getLoading"/>  
      </div>
      <div class="form-group top10">
        <input id="username" type="text" v-model="user" placeholder="User name" 
          class="form-control" required :disabled="getLoading"/>  
      </div>
      <div class="form-group top10">
        <input id="password" v-model="password" type="password" 
          placeholder="Password" v-if="need_password" class="form-control"
          :disabled="getLoading" />  
      </div>
      <div class="form-group top10">
        <input value="Connect" type="submit" class="btn btn-primary btn-width"
          :disabled="getLoading"/>  
      </div>
      </form>
      <br/>
    </div>
  </div>
</template>

<script>
import {getSettings, setSettings} from "../../ipc"
import { mapActions, mapGetters } from 'vuex'

export default {
  props: ['node'],
  emits: ['loading'],
  data() {
    return {
      host: (this.node && this.node.host) || '',
      user: (this.node && this.node.user) || getSettings('username'),
      password: '',
      need_password: false,
    }
  },
  computed: {
    ...mapGetters('nodes',['getLoading','getError','getMessage'])
  },
  watch: {
    node(newNode) {
      this.host = newNode && newNode.host || '';
      this.user = newNode && newNode.user || getSettings('username');
    },
  },
  methods: {
    ...mapActions('nodes',['updateNode','connectNode']),

    onSubmit: async function() {
      let r = await this.connectNode({
          host: this.host, 
          user: this.user,
          password: this.password,
      });
      if (r.stderr.includes('Authentication')) {
        this.need_password = true;
      }
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
