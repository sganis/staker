<template>
<div class="container p-3">
    <div class="d-flex flex-column h-100" >        
        <div class="row h-100 flex-grow-1 p-0 m-0">
          <PoolView v-if="pool" :pool="pool"/>                
        </div>
    </div>    
</div>
</template>

<script>

import PoolView from "./PoolView"

export default {
  components: {PoolView},
  props: ['pool'],

}
</script>

<style scoped>


</style>