<template>
    <div class="sidebar">
      <div class="d-flex flex-column h-100" >
        <div class="row p-2">
          <strong>Nodes</strong>  
        </div>
        <div class="row h-100 flex-grow-1 nodelist">
          <div class="list-group rounded-0 borderless p-0">
            <!-- <a href="#" class="list-group-item list-group-item-action list-group-item-success">
              192.168.100.202
            </a> -->
            <a href="#" @click="showNode(node.ip)"
                class="list-group-item list-group-item-action"
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
import {ref} from 'vue';
import {IPC, MUT} from "../../common/constants"
import { computed } from 'vue'
import {mapState, mapGetters, useStore} from 'vuex'

export default {
  setup() {
    const store = useStore();
    let nodes = store.state.nodes;
    console.log(nodes)
    console.log('value of nodes: ' + nodes.value)
    if (!nodes.value) {
      nodes = window.ipc.sendSync(IPC.GET_NODES);
      store.commit(MUT.SET_NODES, nodes);
      console.log(nodes);
    } else {
      console.log('nodes loaded from store');
    }    
    return {
      nodes: computed(() => store.state.nodes),
      
      // increment: () => store.dispatch('increment'),
      // decrement: () => store.dispatch('decrement'),
      // incrementIfOdd: () => store.dispatch('incrementIfOdd'),
      // incrementAsync: () => store.dispatch('incrementAsync')    

     }
  },

  methods: {  
    showNode(id) {
      this.$router.push(`/nodes/${id}`);
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
