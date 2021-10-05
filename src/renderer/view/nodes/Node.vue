<template>
<div class="container p-3">
    <div class="d-flex flex-column h-100" >        
        <div class="row h-100 flex-grow-1 p-0 m-0">
          <NodeConnect v-if="!node || (node && !node.connected)" :node="node"/>
          <NodeView v-if="node && node.connected" :node="node"/> 

          
          <br />
          <div class="row" v-if="node && node.selected">
            <div class="d-flex justify-content-between subtitle" >
              <div>Actions</div>
            </div>
            <div>
              <button                
                :node="node"
                @click="remove(node)"
                :disabled="getLoading"
                class="btn btn-danger btn-width top10"
              >
                Remove
              </button>
              &nbsp;
            </div>
          </div>           
        </div>
    </div>    
</div>
</template>

<script>

import NodeConnect from "./NodeConnect"
import NodeView from "./NodeView"
import { mapGetters, mapActions } from "vuex";

export default {
  components: {NodeConnect, NodeView},
  props: ['node'],
  computed: {
    ...mapGetters(["getLoading"]),
  },
  methods: {
    ...mapActions("nodes", [
      "deselectAllNodes",
      "removeNode",
    ]),
    remove(node) {
      this.deselectAllNodes();
      this.removeNode(node);
    },
  }
}
</script>

<style scoped>


</style>