<template>
<div class="alert alert-danger my-alert" >
  <div class="d-flex align-items-center">
   <span class="glyphicon glyphicon-exclamation-sign"  role="status" aria-hidden="true"></span>
    {{error}}
 </div>
</div>
</template>

<script>
export default {
    props: {
        error : {
            type: String,
            required : true
        }
    },
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