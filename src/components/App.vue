<template>
<div class="container-sm">
  <Command title="Staker" :stdout="stdout" :stderr="stderr"/>
</div>
</template>

<script>
import Command from './Command.vue'
import {IPC} from '../constants'

export default {
  name: 'App',
  components: {
    Command
  },
  data() {
    return {
      stdout : '',
      stderr: ''
    }
  },
  mounted() { },
  methods: {
    async runLocal(cmd) {
      const r = await window.ipc.invoke(IPC.RUN_LOCAL, cmd);
      this.stdout = r.stdout;
      this.stderr = r.stderr;
    },
    async runRemote(cmd) {
      const r = await window.ipc.invoke(IPC.RUN_REMOTE, cmd);
      this.stdout = r.stdout;
      this.stderr = r.stderr;
    },    
  },
}
</script>

<style>
#app {
  margin-top: 60px;
}
</style>
