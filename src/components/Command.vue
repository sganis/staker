<template>
  <div>
    <h1>{{ title }}</h1>
    <form>
      <div class="mb-3">
      <input v-model="cmd" id="cmd" placeholder="command..." class="form-control">
      </div>
      <button @click="runLocal($event)" class="btn btn-primary">Local</button>
      &nbsp; 
      <button @click="runRemote($event)" class="btn btn-primary">Remote</button>
    </form>
    <br/>
    </div>
    <pre><code>{{stderr.length === 0 ? stdout : 'Error: ' + stderr}}
    </code>
    </pre>
    
</template>

<script>
export default {
  name: 'Command',
  data: function () {
    return {
      cmd : 'dir'
  }},
  props: {
    title: String,
    stdout: String,
    stderr: String,
  },
  methods: {
    runLocal: function (e) {
      e.preventDefault();
      this.$parent.runLocal(this.cmd);
    },
    runRemote: function (e) {
      e.preventDefault();
      this.$parent.runRemote(this.cmd);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
