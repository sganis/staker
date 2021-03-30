<template>
<div class="container-sm">
  <HostForm v-if="!submitted" @submit="submitted = true"/>
  <!-- <Command title="Staker" :stdout="stdout" :stderr="stderr"/> -->
  <h1 v-else class="message">Done!</h1>
</div>
</template>

<script>
//import Command from './Command.vue'
import HostForm from '@/components/HostForm.vue'
import {IPC} from '@/constants'

export default {
  name: 'App',
  components: {
    //Command, 
    HostForm
  },
  data() {
    return {
      stdout : '',
      stderr: '',
      submitted: false
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
    async connectHost(hostname) {
      const r = await window.ipc.invoke(IPC.CONNECT_HOST, hostname);
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
