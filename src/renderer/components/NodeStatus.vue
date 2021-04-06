<template>
<div>
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
        <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
    <div>Status: </div>
        <pre>{{node.status}}</pre>
    <div>&nbsp;</div>
</div>
</template>

<script>

import {mapGetters, mapActions} from 'vuex';

export default {
    props: ['node'],
    data () {
        return {
            polling: null
        }
    },
    computed: {
        ...mapGetters(['getNodeStatus']),
    },
    methods: {
        ...mapActions(['updateNodeStatus']),
        pollData() {
            this.polling = setInterval(() => {
                //console.log('pulling data for node: '+ this.node.host)
                this.updateNodeStatus(this.node);                
            }, 5000);
        }
    },
    beforeUnmount () {
        clearInterval(this.polling);
        //console.log('destroyed');
    },
    mounted () {
        this.pollData();
        //console.log('mounted');
    }
}
</script>