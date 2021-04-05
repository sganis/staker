<template>
    <div class="row flex-grow-1">
        <NodeList/>
        <div class="col p-0">
           <Node :node="node"/>
        </div>
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
       ...mapGetters(['getNode','getNodeSelected',]),
      node() {
        //return this.getNodeSelected();
        return this.getNode(this.$route.params.id);
      }
  },
}
</script>

<style scoped>

</style>