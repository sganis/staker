<template>
<h1 class="text-end">Node</h1>  
<div class="container p-5">
    
    <div class="d-flex flex-column h-100" >        
        <div class="row h-100 flex-grow-1 p-0 m-0">
          <NodeConnect v-if="!node || (node && !node.connected)" :node="node"/>
          <NodeStatus v-if="node && node.connected" :node="node"/>                
        </div>
    </div>
    <div class="row w-100 m-0">
      <div class="text-wrap">{{node}}</div>
    </div>
    <br/>
    <br/>
    <div class="row w-100 m-0">
      <span >
          <button v-if="node && node.connected" :node="node"
            @click="disconnect(node)"
            class="btn btn-primary btn-sm" >Disconnect </button>
          </span></div>
</div>
</template>

<script>

import NodeConnect from "./NodeConnect"
import NodeStatus from "./NodeStatus"
import {mapActions} from 'vuex'

export default {
  components: {NodeConnect, NodeStatus},
  props: ['node'],
  computed: {
    //node: function () {return this.$store.getters.getNodeByIp(this.node.ip)},
  },
  methods: {
    ...mapActions(['disconnectNode','deselectAllNodes']),

    disconnect(node) {
      this.deselectAllNodes();
      this.disconnectNode(node);
    }
  }
}
</script>

<style scoped>

</style>