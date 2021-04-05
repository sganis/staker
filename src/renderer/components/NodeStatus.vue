<template>
<div class="container">
    <h2>Node status</h2>
    <div>CPU: </div>
    <div class="progress">
        <div class="progress-bar bg-success" role="progressbar" 
        style="width: 25%" aria-valuenow="25" aria-valuemin="0" 
        aria-valuemax="100">25%</div>
    </div>
    <div>Memory: </div>
    <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
    <div>Disk: </div>
    <div class="progress">
        <div class="progress-bar" :class="status.diskUsed" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
    <div>&nbsp;</div>
</div>
</template>

<script>
export default {
    props: ['node'],
    data() {
        return {
            status: {},
            counter: 0
        }
    },
    mounted() {
        const that = this
        //setInterval(function(){ 
        //    that.getNodeStatus(); 
       //     console.log('sstatu chsnged')
       // }, 1000);
    },
    methods: {
        getNodeStatus() {
            this.status.diskUsed= `w-${this.counter++}`;
        }
    }
}
</script>