<template>
<div>
    <div class="h3">{{node.host}}</div>
    <div class="d-flex justify-content-center">{{netinfo.sync_progress}}</div>
</div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';

export default {
    props: ['node'],
    data () {
        return {
            polling: null,
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
    },
    methods: {
        ...mapActions('nodes',['updateNodeStatus','updateNetworkInfo']),
        pollData() {
            this.polling = setInterval(() => {
                this.updateNodeStatus(this.node);   
                this.updateNetworkInfo();   
            }, 5000);
        },
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