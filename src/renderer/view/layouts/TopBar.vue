<template>  
<div>
<div class="d-flex align-items-center justify-content-between topbar">
<div>
    <div class="logo">
    <router-link to="/"><img src="/images/logo.png" alt="" width="30" height="30"></router-link>
  </div>
</div>
<div><NodeStatus v-if="node" :node="node"/></div>
<div>
  <!-- <button type="button" class="btn btn-primary btn-sm">Small button</button> -->

  <nav class="navbar navbar topbar">
  <ul class="nav">
  <li class="nav-item">
    <router-link to="/nodes" class="nav-link" 
    >Nodes</router-link>
  </li>
  <li class="nav-item">
    <router-link to="/wallets" class="nav-link"
    :class="{disabled : !node || !node.connected}">Wallets</router-link>
  </li> 
  <li class="nav-item">
    <router-link to="/pools" class="nav-link"
    :class="{disabled : !node || !node.connected}">Pools</router-link>
  </li> 
</ul>
</nav>
</div>
</div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';

import NodeStatus from '../nodes/NodeStatus';

export default {
  components: {NodeStatus},
  computed: {
    node() {
      return this.getNodeSelected();
    }
  },
  methods: {
    ...mapGetters('nodes', ['getNodeSelected']),
  }
}
</script>

<style scoped>
.logo {
    padding-right: 10px; 
}
.topbar {
  padding: 10px;
  margin: 0;
  height: 70px;
}
</style>
