<template>
<div>
    <h2>Node status</h2>
    <div>CPU: </div>
    <div class="progress">
        <div class="progress-bar"  role="progressbar" aria-valuemin="0" aria-valuemax="100"
        :class="{'bg-success' : status.cpu <= 90, 'bg-danger' : status.cpu > 90}"
        :style="{width: status.cpu + '%'}">{{status.cpu}}%</div>
    </div>
    <div>Memory: </div>
    <div class="progress">
        <div class="progress-bar" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"
        :class="{'bg-success' : status.memory <= 90, 'bg-danger' : status.memory > 90}"
        :style="{width: status.memory + '%'}">{{status.memory}}%</div>
    </div>
    <div>Disk: </div>
    <div class="progress">
        <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
        :class="{'bg-success' : status.disk <= 75, 'bg-warning' :  status.disk > 75 && status.disk <= 100, 'bg-danger' : status.disk > 100}"
        :style="{width: status.disk + '%'}">{{status.disk}}%</div>
    </div>
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
        //...mapGetters(['getNodeStatus']),
        status() {
            return {
                disk: this.node.status && this.node.status.disk 
                    ? Math.round(this.node.status.disk[0]/this.node.status.disk[1] * 100) : 0,
                memory: this.node.status && this.node.status.memory 
                    ? Math.round(this.node.status.memory[0]/this.node.status.memory[1] * 100) : 0,
                cpu: this.node.status && this.node.status.cpu 
                    ? Math.round(this.node.status.cpu * 100) : 0,
            }
        },
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