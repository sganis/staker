<template>
    <div v-if="loading">{{message}}</div>
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

