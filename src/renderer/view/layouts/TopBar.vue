<template>  
<div>
<nav class="navbar navbar topbar">
  <div class="logo">
    <router-link to="/"><img src="/images/logo.png" alt="" width="30" height="30"></router-link>
  </div>
  <ul class="nav">
  <li class="nav-item">
    <router-link to="/nodes" class="nav-link fcolor active">Nodes</router-link>
  </li>
  <li class="nav-item">
    <router-link to="/wallets" class="nav-link fcolor">Wallets</router-link>
  </li> 
  <li class="nav-item">
    <router-link to="/explorer" class="nav-link fcolor">Explorer</router-link>
  </li> 
  <li class="nav-item">
    <router-link to="/settings" class="nav-link fcolor">Settings</router-link>
  </li>
</ul>
</nav>
</div>
</template>

<script>

</script>

<style scoped>
.logo {
    padding-left: 10px;
}
.fcolor {
  /* color: white; */
}
.topbar {
  padding: 0;
  margin: 0;
  height: 70px;
}
</style>
