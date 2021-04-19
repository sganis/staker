<template>
  <div class="left">
    <NodeList/>
  </div>
  <div class="main">
    <Node :node="node"/>
  </div> 
</template>

<script>
import NodeList from "./NodeList"
import Node from "./Node"
import {mapGetters} from 'vuex'

export default {
    components: { NodeList, Node, },
    data() {
      return {}
    },
    computed: {
       ...mapGetters('nodes',['getNode','getNodeSelected',]),
      node() {
        let n = this.getNodeSelected;
        return n;
        //return this.getNode(this.$route.params.id);
      }
  },
}
</script>

<style scoped>

</style>