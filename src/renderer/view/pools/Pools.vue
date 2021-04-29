<template>
  <div class="left">
    <PoolList/>
  </div>
  <div class="main">
    <Pool :pool="pool"/>
  </div> 
</template>

<script>
import PoolList from "./PoolList"
import Pool from "./Pool"
import {mapGetters} from 'vuex'

export default {
    components: { PoolList, Pool, },
    data() {
      return {}
    },
    computed: {
       ...mapGetters('pools',['getPool','getPoolSelected',]),
      pool() {
        let n = this.getPoolSelected;
        return n;
        //return this.getPool(this.$route.params.id);
      }
  },
}
</script>

<style scoped>

</style>