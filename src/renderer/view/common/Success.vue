<template>
<div class="box">
<div class="alert alert-success alert-dismissible fade show my-alert" >
  <div class="d-flex align-items-center">
   <span class="glyphicon glyphicon-exclamation-sign"  
        role="status" aria-hidden="true"></span>
    {{message}}
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

