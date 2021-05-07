<template>

    <BIconCheckCircleFill
        class="icon-success"
        v-if="status===1" />
    <BIconExclamationCircleFill
        class="icon-danger"
        v-if="status === 2" />
    <BIconDashCircle
        class="text-secondary"
        v-if="status !== 1 && status !== 2" />

</template>

<script>
export default {
    props: ["status"], // 0: undefinded or n/a, 1: ok, 2: bad    
}
</script>

