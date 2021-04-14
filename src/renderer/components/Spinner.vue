<template>
<div v-if="loading" class="alert alert-warning p-2 w-100" >
<div class="d-flex align-items-center">
  <div class="spinner-border text-secondary" role="status" aria-hidden="true"></div>
  &nbsp;&nbsp;
  <span>{{message}}</span>
</div>
</div>
</template>

<script>
export default {
    props : ['loading','message'],
}
</script>