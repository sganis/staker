<template>
  <div>
    <h1>Create Wallet</h1>
    <form @submit.prevent="onSubmit">
      <div class="form-group ">
        <input id="name" v-model="name" placeholder="Wallet name..." 
          class="form-control" required />  
      </div>
      <div class="form-group top10">
        <input value="Create" type="submit" class="btn btn-primary btn-width"
          :disabled="loading"/>  
      </div>
    </form>
    <br/>
    </div>
    <Error :message="error" />
    <Loading :message="message" :loading="loading" />
    <div v-if="!loading">{{message}}</div>
</template>

<script>
import Error from "./Error"
import Loading from "./Loading"
//import {getSettings, setSettings, createAddress} from "../ipc"
import { mapActions } from 'vuex'
import {sleep} from '../../common/util'

export default {
  components : { Error, Loading },
  props: ['wallet'],
  data() {
    return {
      name: '',
      loading: false,
      error: '',
      message: '',
    }
  },
//   watch: {
//     node(newNode) {
//       this.host = newNode && newNode.host || '';
//       this.user = newNode && newNode.user || getSettings('username');
//     },
//   },
  methods: {
    ...mapActions(['updateWallet','createWallet']),

    onSubmit: async function() {
        this.loading = true;     
        this.error = ''
        this.message = `Creating wallet...`;
        let r = await this.createWallet(this.name);
        if (r.rc === 0) {
            this.updateWallet({
                name: this.name, 
                selected: true,
            });          
        } else {
            this.loading = false;
            this.message = '';
            this.error = r.stderr
            console.log(this.error);
            await sleep(5000);
        }
        this.loading = false;   
      }
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
