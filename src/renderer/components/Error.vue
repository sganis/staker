<template>
    <div class="alert alert-danger" v-if="message">{{message}}</div>
</template>

<script>
export default {
    props: {
        message : {
            type: String,
            required : true
        }
    },

    setup(props) {
        //console.log(props.message);
        return {

        }
    },
}
</script>
