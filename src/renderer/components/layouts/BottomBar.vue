<template>
    <div class="bottombar">
        <Loading :loading="loading" :message="msg"/>
    </div>
</template>

<script>

import Loading from "../Loading"

export default {
   components : { Loading },
}
</script>

<style scoped>
.bottombar {
    height: 60px;
    background: rgb(233, 233, 233);
}
</style>