<template>
    <div class="bottombar">
        <Spinner :loading="loading" :message="msg"/>
    </div>
</template>

<script>

import Spinner from "../Spinner"

export default {
   components : { Spinner },
}
</script>

<style scoped>
.bottombar {
    height: 60px;
    background: rgb(233, 233, 233);
}
</style>