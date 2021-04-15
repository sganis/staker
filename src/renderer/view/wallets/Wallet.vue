<template>
<h1 class="text-end">Wallet</h1>  
<div class="container p-5">
    
    <div class="d-flex flex-column h-100" >        
        <div class="row h-100 flex-grow-1 p-0 m-0">
          <WalletCreate v-if="!wallet" :wallet="wallet"/>
          <WalletView v-if="wallet" :wallet="wallet"/>                
        </div>
    </div>
    <!-- <div class="row w-100 m-0">
      <div class="text-break">{{wallet}}</div>
    </div> -->
    <div class="row w-100 m-0">
    <span>
          <button v-if="wallet && wallet.connected" :wallet="wallet"
            @click="disconnect(wallet)"
            class="btn btn-primary btn-width" >Disconnect</button>&nbsp;
            <br/>           
          <button v-if="wallet" :wallet="wallet"
            @click="remove(wallet)"
            class="btn btn-danger btn-width" >Remove</button>
         </span>
         </div>
</div>
</template>

<script>

import WalletCreate from "./WalletCreate"
import WalletView from "./WalletView"
import {mapActions} from 'vuex'

export default {
  components: {WalletCreate, WalletView},
  props: ['wallet'],
  data() {
    return {

    }
  },
  computed: {
    //wallet: function () {return this.$store.getters.getWalletByIp(this.wallet.ip)},
  },
  methods: {
    ...mapActions('wallets', ['deselectAllWallets','removeWallet',]),

    remove(wallet) {
      this.deselectAllWallets();
      this.removeWallet(wallet);
    }
  }
}
</script>

<style scoped>


</style>