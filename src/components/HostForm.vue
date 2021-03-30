<template>
  <div>
    <h1>Host</h1>
    <form @submit="connect($event)">
    <div class="mb-3"><input v-model="hostname" id="host" placeholder="IP or hostname" class="form-control"/>  </div>     
    <div class="mb-3"><input @click="submit" value="Connect" type="submit" class="btn btn-primary"/>  </div> 
    </form>
    <br/>
    </div>
    <pre>{{error.length !== 0 ? error : ''}}</pre>
</template>

<script>
export default {
  name: 'HostForm',
  data: function () {
    return {
      error : '',
      hostname : ''
  }},
  props: ['host'],
  methods: {
    submit () {
      this.$emit('submit')
    },
    connect: function (e) {
      e.preventDefault();
      this.$parent.connectHost(this.hostname);
    },
   
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
</style>
