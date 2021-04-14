<template>
<div class="container d-flex top10 " style="height:70px">
  <Spinner :loading="getLoading" :message="getMessage"/>
  <Error :error="getError" />
</div>
<div class="container p-3">
    <div class="d-flex flex-column h-100" >        
        <div class="row h-100 flex-grow-1 p-0 m-0">
          <NodeConnect v-if="!node || (node && !node.connected)" :node="node"/>
          <NodeStatus v-if="node && node.connected" :node="node"/>                
        </div>
    </div>
    <br/><br/>
    <div class="row w-100 m-0"
      v-if="node && !node.has_tools">
      <span>
      <span v-if="!installing_tools">Tools not installed.</span>
      <br/>
      <br/>
      <button v-if="node && node.connected" :node="node"
            @click="setup(node)"
            class="btn btn-success btn-width" >Install Tools</button>
            </span>
    </div>
    <br/>
    <div class="row w-100 m-0">
      <div class="text-wrap">{{node}}</div>
    </div>
    <br/>
    <br/>
    <br/>
    <div class="row w-100 m-0">
    <span>
          <button v-if="node && node.connected" :node="node"
            @click="disconnect(node)"
            class="btn btn-primary btn-width" >Disconnect</button>&nbsp;
          
            <br/>
            <br/>           
          <button v-if="node" :node="node"
            @click="remove(node)"
            class="btn btn-danger btn-width" >Remove</button>
         </span>
         </div>
</div>
</template>

<script>

import NodeConnect from "./NodeConnect"
import NodeStatus from "./NodeStatus"
import Spinner from "./Spinner"
import Error from "./Error"
import {mapGetters, mapActions} from 'vuex'

export default {
  components: {Spinner,Error,NodeConnect, NodeStatus},
  props: ['node'],
  data() {
    return {
      installing_tools: false,
    }
  },
  computed: {
    ...mapGetters('nodes',['getLoading','getError','getMessage']),
  },
  watch: {
    node(n) {
      this.hasTools(n);
    }
  },
  methods: {
    ...mapActions('nodes',[
        'disconnectNode','deselectAllNodes','removeNode','setupNode','hasTools'
    ]),
    
    disconnect(node) {
      this.deselectAllNodes();
      this.disconnectNode(node);
    },
    setup(node) {
      this.setupNode(node);
    },
    remove(node) {
      this.deselectAllNodes();
      this.removeNode(node);
    }
  }
}
</script>

<style scoped>


</style>