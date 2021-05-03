<template>
  <div class="row p-2">
    <div class="text-center">
    <button @click="addPool()" 
      class="btn btn-success btn-width" disabled>Add Pool</button>
    </div>
  </div>
  <div class="list-group rounded-0 poollist">
    <a href="#" @click="showPool(pool)"
        class="list-group-item list-group-item-action"
        :class="{active: pool.selected}"
        v-for="pool in getPools" :key="pool.name">{{pool.name}}</a>
  </div>
</template>

<script>
import {IPC} from "../../../common/constants"
import {mapGetters, mapActions} from 'vuex'

export default {
  computed: {
    ...mapGetters('pools',['getPools','getPoolSelected']),
  },

  mounted() {
    //console.log('value of pools: ' + this.pools)
    if (this.getPools.length ===0) {
      let pools = window.ipc.sendSync(IPC.GET_POOLS);
      if (pools) {
        pools.forEach((n) => {
          this.updatePool(n);
        });
      }
    } else {
      console.log('pools loaded from store');
    }        
  },

  methods: {  
    ...mapActions('pools',['updatePool','deselectAllPools']),  

    showPool(pool) {
      this.deselectAllPools();     
      this.updatePool({id: pool.id, selected: true});
      this.$router.push(`/pools/${pool.id}`);
    },
    addPool() {
      this.deselectAllPools();     
      this.$router.push('/pools');
    }
  }

}
</script>


<style scoped>
</style>
