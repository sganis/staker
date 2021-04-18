<template>
<div class="box">
<div class="alert alert-warning my-alert" >
  <div class="d-flex align-items-center">
   <div class="spinner-border" role="status" aria-hidden="true"></div>
    &nbsp;&nbsp;
    <span>{{message}}</span>
  </div>
</div>
</div>
</template>

<script>
export default {
    props : ['message'],
}
</script>
