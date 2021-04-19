<template>
  <div class="left">
    <WalletList/>
  </div>
  <div class="main">
    <Wallet :wallet="wallet"/>
  </div> 
</template>

<script>
import WalletList from "./WalletList"
import Wallet from "./Wallet"
import {mapGetters} from 'vuex'

export default {
    components: { WalletList, Wallet, },
    computed: {
       ...mapGetters('wallets', ['getWallet','getWalletSelected',]),
      wallet() {
        return this.getWalletSelected;        
      }
  },
}
</script>

<style scoped>

</style>