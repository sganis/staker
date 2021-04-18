<template>
<div class="container p-3">
    <div class="d-flex flex-column h-100" >        
        <div class="row h-100 flex-grow-1 p-0 m-0">
          <WalletCreate v-if="!wallet" />
          <WalletView v-if="wallet" :wallet="wallet"/>                
        </div>
    </div>
</div>
</template>

<script>

import WalletCreate from "./WalletCreate"
import WalletView from "./WalletView"

export default {
  components: {WalletCreate, WalletView},
  props: ['wallet'],
  data() {
    return {
    }
  },
  computed: {

  },
  methods: {
    //...mapActions('wallets', ['',]),
  }
}
</script>
