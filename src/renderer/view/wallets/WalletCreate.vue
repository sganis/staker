<template>
  <div>
    <h1>Create Wallet</h1>
    <div>
    <form @submit.prevent="onSubmit">
      <div class="form-group ">
        <input id="name" v-model="wallet.name" placeholder="Wallet name" 
          class="form-control" required :disabled="getLoading" />  
      </div>
      <div class="form-group top10">
        <input id="password" v-model="wallet.password" type="password" 
          placeholder="New password" 
          class="form-control" :disabled="getLoading" />  
      </div>
      <div class="form-check top10">
        <input id="use_words" v-model="wallet.use_words" type="checkbox" 
          class="form-check-input" :disabled="getLoading" />  
          <label class="form-check-label" for="use_words">
            Use 24 words from other wallet</label>
      </div>
      <div class="form-group top10">
          <textarea id="words" v-model="wallet.words" placeholder="Words" 
            v-if="wallet.use_words"  class="form-control text-words" 
            :disabled="getLoading" />
      </div>            
      <div class="form-group top10">
        <input value="Create" type="submit" class="btn btn-primary btn-width"
          :disabled="getLoading"/>  
      </div>
    </form>
    <br/>
    </div>
  </div>
</template>

<script>
import Error from "../common/Error"
import Spinner from "../common/Spinner"
import { mapGetters, mapActions } from 'vuex'
import {sleep} from '../../../common/util'

export default {
  components : { Error, Spinner },
  //props: ['wallet'],
  data() {
    return {
      wallet: {
        name: 'wallet01',
        password: 'Password123',
        use_words : false,
        words: 'devote fortune face surprise capable surprise tent tumble sign sausage napkin crunch cake torch stem solve company name void elephant welcome rally paddle adapt',
      }
    }
  },
  computed: {
    ...mapGetters('wallets',['getLoading'])
  },
  methods: {
    ...mapActions('wallets', ['updateWallet','createWallet']),

    onSubmit: async function() {
        let r = await this.createWallet(this.wallet);
        if (r.rc !== 0) {
            // something was wrong
            // 1. week password
            // 2. invalid words
            // 3. invalid name?
            console.log(r.stderr);
        }
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
.text-words {
  height: 120px;
}
</style>
