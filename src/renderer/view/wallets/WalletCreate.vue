<template>
  <div>
    <h1>Create Wallet</h1>
    <div v-if="!newwords">
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
    <div v-if="newwords">
      <p> Take note of these recovery words: </p>
      <form>
        <div class="form-group">
          <textarea :value="newwords" class="form-control" />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Error from "../common/Error"
import Spinner from "../common/Spinner"
import { mapGetters, mapActions } from 'vuex'

export default {
  components : { Error, Spinner },
  //props: ['wallet'],
  data() {
    return {
      wallet: {
        name: '',
        password: '',
        use_words : false,
        words: '',
      },
      newwords: '',
    }
  },
  computed: {
    ...mapGetters(['getLoading'])
  },
  methods: {
    ...mapActions('wallets', ['update','create']),

    onSubmit: async function() {
        let r = await this.create(this.wallet);
        if (r.rc !== 0) {
            // something was wrong
            // 1. week password
            // 2. invalid words
            // 3. invalid name?
            console.log(r.stderr);
        } else {
          this.newwords = r.newwords;
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
