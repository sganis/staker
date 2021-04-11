<template>
  <div class="container-fluid">
  <div class="row min-vh-100">
    <div class="col">
      <div class="d-flex flex-column h-100">
        <TopBar/>
        <router-view/>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import TopBar from './layouts/TopBar'
import BottomBar from './layouts/BottomBar'
//import Host from '@/components/Host'
//import {IPC} from '@/shared/constants'

export default {
  components: { TopBar, BottomBar },
  data() {
    return {
      stdout : '',
      stderr: '',
      submitted: false,
      loading: false

    }
  },
  mounted() {
    this.$router.push('/nodes');

   },
  methods: {
   
  },
}
</script>

<style>
#app {
  /* margin-top: 60px; */
}
.topbar {
  height: 60px;
}
.main {
  margin-top: 60px;
}

.btn-width {
  width: 150px;
}
.top10 { margin-top:10px; }

</style>
