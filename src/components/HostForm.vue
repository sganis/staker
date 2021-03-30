<template>
  <div>
    <h1>Host</h1>
    <form novalidate @submit.prevent="onSubmit">
      <div class="form-group ">
      <input id="hostname" v-model="dat.host" placeholder="Hostname or IP" class="form-control"/>  
      </div>
      <div class="form-group top10">
      <input id="hostname" v-model="dat.user" placeholder="User name" class="form-control"/>  
      </div>
      <div class="form-group top10">
      <input value="Connect" type="submit" class="btn btn-primary"/>  
      </div>
    </form>
    <br/>
    </div>
    <Error :message="error" />
    <div><pre>{{dat}}</pre></div>
</template>

<script>
import {ref} from 'vue';
import Error from "@/components/Error.vue"

export default {
  components : {
    Error,
  },
  setup() {
    const dat = ref({
      host : '',
      user : ''
    });
    const error = ref('');

    function onSubmit() {
      error.value = 'not implemented';
    }
    return {
      dat, onSubmit,error
    };
  },
  name: 'HostForm',
  props: ['host'],

  methods: {
    submit: function () {
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
.top10 { margin-top:10px; }
</style>
