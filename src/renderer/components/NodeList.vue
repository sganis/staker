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
          <button @click="addNode()" class="btn btn-primary">Add Node</button>
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
    ...mapGetters(['getNodes','getNodeSelected']),
    
    nodes() { 
      let n = this.getNodes(); 
      console.log('getter getNodes: '+ JSON.stringify(n));
      return n;
    },
    
  },

  mounted() {
    console.log('value of nodes: ' + this.nodes)
    if (this.nodes.length ===0) {
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
    ...mapActions(['updateNode','deselectAllNodes']),  

    showNode(node) {
      this.deselectAllNodes();     
      this.updateNode({ip: node.ip, selected: true});
      this.$router.push(`/nodes/${node.ip}`);
    },
    addNode() {
      this.deselectAllNodes();     
      this.$router.push('/nodes');
    }
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
