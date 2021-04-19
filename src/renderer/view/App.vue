<template>
<div class="wrap">
  <div class="top">
    <TopBar v-if="!getLoading && !getError && !getMessage"/>
    <Spinner v-if="getLoading" :message="getMessage"/>
    <Error v-if="!getLoading && getError" :error="getError" />
    <Success v-if="!getLoading && !getError && getMessage" :message="getMessage" />
  </div>
  <div class="mid">
    <router-view/>    
  </div>
</div>
</template>

<script>
import TopBar from './layouts/TopBar'
import Spinner from "./common/Spinner"
import Error from "./common/Error"
import Success from "./common/Success"
import {mapGetters} from 'vuex'

export default {
  components: { TopBar, Spinner, Error, Success },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters('nodes',['getLoading','getError','getMessage']),
  },
  mounted() {
    this.$router.push('/nodes');
  },
  methods: {
   
  },
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
.wrap {
  height: 100vh;
  width: 100%;
  background-color: yellow;
}
.top {
  width: 100%;
  height: 70px;
  background-color: silver;
}
.mid {
  width: 100%;
  height: calc(100% - 70px);
  background-color: green;
}
.left {
  width: 200px;
  height: 100%;
  float: left;
  overflow: hidden;
  overflow-y: auto;
  background: gainsboro;
}
.main {
  width: calc(100% - 200px);
  height: 100%;
  background: white;
  overflow: hidden;
  overflow-y: auto  
}
.btn-width {
  width: 160px;
}
.top10 { margin-top:10px; }

h2 {
   /* width: 100%;  */
   border-bottom: 1px solid gainsboro; 
   padding-top: 20px;
   /* line-height: 0.1em; */
   /* margin: 30px 30px 30px 0px;  */
} 
.box {
  padding: 5px;
}
.my-alert {
  vertical-align: middle;
  height: 60px;
  border-radius: 0;
  width: 100%;
}



</style>
