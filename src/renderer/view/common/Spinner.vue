<template>
<div class="alert alert-warning my-alert" >
  <div class="d-flex align-items-center">
   <div class="spinner-border" role="status" aria-hidden="true"></div>
    &nbsp;&nbsp;
    <span>{{message}}</span>
  </div>
</div>
</template>

<script>
export default {
    props : ['message'],
}
</script>

<style scoped>
.my-alert {
  vertical-align: middle;
  height: 60px;
  border-radius: 0;
  width: 100%;
}
</style>