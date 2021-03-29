<template>
  <div>
    <h1>{{ msg }}</h1>
    <form>
      <div class="mb-3">
      <input id="cmd" type="text" class="form-control">
      </div>
      <button @click="say('ok')" class="btn btn-primary">Run</button>
    </form>
    </div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    msg: String
  },
  methods: {
    say: function () {
      this.$parent.readFile('package.json');
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
