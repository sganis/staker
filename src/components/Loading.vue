<template>
<div v-if="loading" class="d-flex align-items-center">
    {{message}}
    <div class="spinner-border text-secondary ms-auto" role="status" 
        aria-hidden="true">
    </div>
</div>  
</template>

<script>
export default {
    props: {
        message : {
            type: String,
            default: 'Loading...'
        },
        loading : {
            type: Boolean,
            default: false
        }
    }, 
}
</script>

