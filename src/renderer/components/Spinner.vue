<template>
<div v-if="loading" class="d-flex align-items-center">
  {{message}}
  <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
</div>
</template>

<script>
export default {
    props : ['loading','message'],
}
</script>