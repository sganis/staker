<template>
<div v-if="error" class="alert alert-danger w-100" role="alert">
  <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
  {{error}}
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
