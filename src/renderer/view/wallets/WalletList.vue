<template>
    <div class="sidebar">
      <div class="d-flex flex-column h-100" >
        <div class="row p-2">
          <strong>Wallets</strong>  
        </div>
        <div class="row h-100 flex-grow-1 nodelist">
          <div class="list-group rounded-0 borderless p-0">
            <a href="#" @click="showWallet(wallet)"
                class="list-group-item list-group-item-action"
                :class="{active: wallet.selected}"
                v-for="wallet in getWallets" :key="wallet.id">{{wallet.name}}</a>
          </div>
        </div>
        <div class="row p-2">
          <button @click="addWallet()" class="btn btn-primary">Add Wallet</button>
        </div>
      </div>
    </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

export default {
  mounted() {
      this.loadWallets();
  },
  computed: {
    ...mapGetters('wallets', ['getWallets','getWalletSelected']),
  },
  methods: {  
    ...mapActions('wallets', ['loadWallet','loadWallets','updateWallet','deselectAllWallets']),  

    async showWallet(w) {
        // call mutations directly as they are sync?
        this.deselectAllWallets();     
        this.updateWallet({id: w.id, selected: true});
        await this.loadWallet(w);
        this.$router.push(`/wallets/${w.id}`);
    },
    addWallet() {
      this.deselectAllWallets();     
      this.$router.push('/wallets');
    }
  }
}
</script>


<style scoped>
.sidebar {
  width: 200px; /* Set the width of the sidebar */
  background-color: rgba(226, 226, 226, 0.972); /* Black */
}

.borderless {
  border: 0;
  width: 100%;
  margin: 0;
}
</style>
