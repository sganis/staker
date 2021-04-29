<template>
<div class="box">
<div class="alert alert-success alert-dismissible fade show my-alert" >
  <div class="d-flex align-items-center">
    <span>
    <BIconCheckCircleFill class="icon-success" />
    &nbsp;&nbsp;
    {{message}}
    </span>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
 </div>
</div>
</div>
</template>

<script>
export default {
    props: ['message'],
}
</script>

