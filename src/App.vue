<template>
<div class="container-sm">
  <Header msg="Staker"/>
</div>
</template>

<script>
import Header from './components/Header.vue'


// const fs = require('fs')
// const root = fs.readdirSync('/')
// console.log(root)

export default {
  name: 'App',
  components: {
    Header
  },
  mounted() {
    // handle reply from the backend
    window.ipc.on('READ_FILE', (payload) => {
      console.log(payload.content);
    });
  },
  methods: {
    readFile(path) {
      // ask backend to read file
      const payload = { path };
      window.ipc.send('READ_FILE', payload);
    },
  },
}
</script>

<style>
#app {
  margin-top: 60px;
}
</style>
