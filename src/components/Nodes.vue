<template>
    <div class="row flex-grow-1">
        <NodeList/>
        <div class="col p-0">
           <Node :id="$route.params.id"/>
        </div>
    </div>
</template>

<script>
import NodeList from "@/components/NodeList"
import Node from "@/components/Node"

export default {
    components: { NodeList, Node, },
    data() {
      return {
      id: 0
    }},
    computed: {
      // nodeid() {
        // this.id = this.$route.params.id;
        // console.log('node id: '+ this.id);
        // //let nodes = window.ipc.sendSync(IPC.GET_NODES);
        // //return nodes[0];
        // return this.id;
      // }
  },
}
</script>

<style scoped>

</style>