<template>
<div>
    <div class="d-flex flex-column h-100 bg-gray p-0 m-0" >
        <div class="row p-2 w-100 m-0">
          <p class="text-end"><strong>Node: {{node}}</strong></p>  
        </div>
        <div class="row h-100 flex-grow-1 p-0 m-0">
          <NodeConnect/>
        </div>
    </div>
</div>
</template>

<script>

import NodeConnect from "./NodeConnect"

export default {
  components: {NodeConnect},
  props: ['id'],
  computed: {
    node: function () {return this.$store.getters.getNodeByIp(this.id)},
  }
}
</script>

<style scoped>

</style>