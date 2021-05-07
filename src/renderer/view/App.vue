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
    ...mapGetters(['getLoading','getError','getMessage']),
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
   color:rgb(109, 109, 109);
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
pre {
  white-space: pre-wrap;
}
.monospace {
  font-family:monospace;
          
}
.icon-success {
  color: #198754;
  width: 16px;
  height: 16px;
}
.icon-info {
  color: #0dcaf0;
  width: 16px;
  height: 16px;
}
.icon-warning {
  color: #ffc107;
  width: 16px;
  height: 16px;
}
.icon-danger {
  color: #dc3545;
  width: 16px;
  height: 16px;
}

/* bootstrap 5 colors
------------------
$blue:    #0d6efd;
$indigo:  #6610f2;
$purple:  #6f42c1;
$pink:    #d63384;
$red:     #dc3545;
$orange:  #fd7e14;
$yellow:  #ffc107;
$green:   #198754;
$teal:    #20c997;
$cyan:    #0dcaf0;

$primary:       $blue;
$secondary:     $gray-600;
$success:       $green;
$info:          $cyan;
$warning:       $yellow;
$danger:        $red;
$light:         $gray-100;
$dark:          $gray-900;

$white:    #fff;
$gray-100: #f8f9fa;
$gray-200: #e9ecef;
$gray-300: #dee2e6;
$gray-400: #ced4da;
$gray-500: #adb5bd;
$gray-600: #6c757d;
$gray-700: #495057;
$gray-800: #343a40;
$gray-900: #212529;
$black:    #000; */

</style>

