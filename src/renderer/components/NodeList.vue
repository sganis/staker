<template>
    <div class="sidebar">
      <div class="d-flex flex-column h-100" >
        <div class="row p-2">
          <strong>Nodes</strong>  
        </div>
        <div class="row h-100 flex-grow-1 nodelist">
          <div class="list-group rounded-0 borderless p-0">
            <a href="#" @click="showNode(node)"
                class="list-group-item list-group-item-action"
                :class="{active: node.selected}"
                v-for="node in nodes" :key="node.ip">{{node.ip}}</a>
          </div>
        </div>
        <div class="row p-2">
          <button class="btn btn-primary">Add Node</button>
        </div>
      </div>
    </div>
</template>

<script>
import {IPC, MUT} from "../../common/constants"
import {mapGetters, mapActions} from 'vuex'

export default {
  data() {
    return {

    }
  },
  
  computed: {
    nodes() {  return this.$store.state.nodes; },
    ...mapGetters(['getNodeSelected']),
  },

  mounted() {
    let nodes = this.$store.state.nodes;
    console.log('value of nodes: ' + this.$store.state.nodes)
    if (nodes.length === 0) {
      window.ipc.sendSync(IPC.GET_NODES).forEach((n) => {
        this.$store.commit(MUT.UPDATE_NODE, n)
      });


      //this.$store.commit(MUT.SET_NODES, _nodes);
      //console.log('after commit: ' +  JSON.stringify(this.$store.state.nodes));
    } else {
      console.log('nodes loaded from store');
    }        
  },

  methods: {  
    ...mapActions['setNodeSelected'],      
    showNode(node) {
      this.nodes.forEach(n => n.selected = false);
      this.$store.dispatch('setNodeSelected', node);
      //this.$router.push(`/nodes/${node.ip}`);
    },
    
  }

}
</script>


<style scoped>
.sidebar {
  width: 200px; /* Set the width of the sidebar */
  background-color: rgba(226, 226, 226, 0.972); /* Black */
}

.borderless {
  border: 0;
  width: 100%;
  margin: 0;
}
</style>
