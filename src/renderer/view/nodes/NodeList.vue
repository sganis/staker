<template>
  <div class="row p-2">
    <div class="text-center">
    <button @click="addNode()" 
      class="btn btn-success btn-width">Add Node</button>
    </div>
  </div>
  <div class="list-group rounded-0 nodelist">
    <a href="#" @click="showNode(node)"
        class="list-group-item list-group-item-action"
        :class="{active: node.selected}"
        v-for="node in getNodes" :key="node.host">{{node.host}}</a>
  </div>
</template>

<script>
import {IPC} from "../../../common/constants"
import {mapGetters, mapActions} from 'vuex'

export default {
  computed: {
    ...mapGetters('nodes',['getNodes','getNodeSelected']),
  },

  mounted() {
    //console.log('value of nodes: ' + this.nodes)
    if (this.getNodes.length ===0) {
      let nodes = window.ipc.sendSync(IPC.GET_NODES);
      if (nodes) {
        nodes.forEach((n) => {
          this.updateNode(n);
        });
      }


      //this.$store.commit(MUT.SET_NODES, _nodes);
      //console.log('after commit: ' +  JSON.stringify(this.$store.state.nodes));
    } else {
      console.log('nodes loaded from store');
    }        
  },

  methods: {  
    ...mapActions('nodes',['updateNode','deselectAllNodes']),  

    showNode(node) {
      this.deselectAllNodes();     
      this.updateNode({host: node.host, selected: true});
      this.$router.push(`/nodes/${node.host}`);
    },
    addNode() {
      this.deselectAllNodes();     
      this.$router.push('/nodes');
    }
  }

}
</script>


<style scoped>
/* .fill {
  height: 100%;
} */
.nodelist {
  border: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  background: red;
}
</style>
