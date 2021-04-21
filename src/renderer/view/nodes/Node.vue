<template>
<div class="container p-3">
    <div class="d-flex flex-column h-100" >        
        <div class="row h-100 flex-grow-1 p-0 m-0">
          <NodeConnect v-if="!node || (node && !node.connected)" :node="node"/>
          <NodeView v-if="node && node.connected" :node="node"/>                
        </div>
    </div>    
</div>
</template>

<script>

import NodeConnect from "./NodeConnect"
import NodeView from "./NodeView"
//import {mapGetters, mapActions} from 'vuex'

export default {
  components: {NodeConnect, NodeView},
  props: ['node'],

}
</script>

<style scoped>


</style>