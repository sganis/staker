<template>
<div class="box">
<div class="alert alert-danger alert-dismissible fade show  my-alert" >
  <div class="d-flex align-items-center">
    <span>
    <BIconExclamationCircleFill class="icon-danger" />
    &nbsp;&nbsp;
    {{error}}
    </span>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
 </div>
</div>
</div>
</template>

<script>
export default {
    props: ['error']
}
</script>

