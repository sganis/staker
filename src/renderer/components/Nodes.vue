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

export default {
    components: { NodeList, Node, },
    data() {
      return {
        //node: null
    }},
    computed: {
      // ...mapGetters([
      //   'getNodeByIp',
      // ]),
      node() {
        return this.$store.getters.getNodeByIp(this.$route.params.id);
        // console.log('node id: '+ this.id);
        // return this.id;
      }
  },
}
</script>

<style scoped>

</style>