<template>
    <div class="row flex-grow-1">
        <WalletList/>
        <div class="col">
            <Wallet :wallet="wallet"/>
        </div>
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