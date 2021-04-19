<template>
<div>
    <!-- <pre> {{ getNetworkInfo }}</pre> -->
    <h2>Node status</h2>
    <!-- <Progress :percent="netinfo.sync_progress"/> -->
    <span>  Sync status: {{ netinfo.sync_progress }}<br/>
            Epoch: {{ netinfo.node_epoch }}/{{ netinfo.network_epoch }}<br/>
            <!-- Slot: {{ netinfo.node_slot }}/{{ netinfo.network_slot }} -->
    </span>
    <br/>
    <br/>
    <div class="row">
    <div class="col-3">CPU: </div>
    <div class="col-3">Memory:</div>
    <div class="col-3">Disk: </div>
    </div>
    <div class="row">    
    <div class="col-3">
        <div class="progress">
        <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
        :class="{'bg-success' : status.cpu <= 90, 'bg-danger' : status.cpu > 90}"
        :style="{width: status.cpu + '%'}">{{status.cpu}}%</div>
        </div>
    </div>
    <div class="col-3">
        <div class="progress">
        <div class="progress-bar" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"
        :class="{'bg-success' : status.memory <= 90, 'bg-danger' : status.memory > 90}"
        :style="{width: status.memory + '%'}">{{status.memory}}%</div>
        </div>
    </div>
    <div class="col-3">
        <div class="progress">
        <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
        :class="{'bg-success' : status.disk <= 75, 'bg-warning' :  status.disk > 75 && status.disk <= 100, 'bg-danger' : status.disk > 100}"
        :style="{width: status.disk + '%'}">{{status.disk}}%</div>
        </div>
    </div>
    </div>
    
    
</div>
</template>

<script>

import {mapGetters, mapActions} from 'vuex';
//import Progress from '../common/Progress'

export default {
    props: ['node'],
    //components: {Progress},
    data () {
        return {
            polling: null
        }
    },
    computed: {
        ...mapGetters('nodes',['getNodeStatus','getNetworkInfo']),
        netinfo() {
            if (!this.getNetworkInfo.sync_progress)
                return {};
            let ni = {};
            ni.sync_progress = this.getNetworkInfo.sync_progress.status === 'ready'
                ? '100%' 
                : Math.trunc(this.getNetworkInfo.sync_progress.progress.quantity) + '%';
            ni.network_epoch = this.getNetworkInfo.network_tip.epoch_number;
            ni.network_slot = this.getNetworkInfo.network_tip.slot_number;
            ni.node_epoch = this.getNetworkInfo.node_tip.epoch_number;
            ni.node_slot = this.getNetworkInfo.node_tip.slot_number;
            return ni;
        },
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
        ...mapActions('nodes',['updateNodeStatus','updateNetworkInfo']),
        pollData() {
            this.polling = setInterval(() => {
                //console.log('pulling data for node: '+ this.node.host)
                this.updateNodeStatus(this.node);   
                this.updateNetworkInfo();   
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

<style scoped>

</style>