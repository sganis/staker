<template>
<div class="container d-flex top10 " style="height:70px">
  <Spinner :loading="getLoading" :message="getMessage"/>
  <Error :error="getError" />
</div>
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
import Spinner from "../common/Spinner"
import Error from "../common/Error"
import {mapGetters, mapActions} from 'vuex'

export default {
  components: {Spinner, Error, WalletCreate, WalletView},
  props: ['wallet'],
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters('wallets',['getLoading','getError','getMessage']),
  },
  methods: {
    //...mapActions('wallets', ['',]),
  }
}
</script>
