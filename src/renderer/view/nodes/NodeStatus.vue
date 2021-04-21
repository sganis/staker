<template>
<div>
    <div class="h3" :style="{color: node.connected ? 'black' : 'gray'}">{{node.host}}</div>
    <div class="d-flex justify-content-center">
        <BIconLightbulbFill :style="{color: nodeConnectedColor}" /> &nbsp;&nbsp;
        <BIconGearFill :style="{color: nodeStatusColor}" /> &nbsp;&nbsp;
        <BIconWalletFill :style="{color: walletStatusColor}" /> &nbsp;&nbsp;
        <BIconStopwatchFill :style="{color: timeStatusColor}" /> &nbsp;&nbsp;
        
        <!-- {{netinfo.sync_progress}} -->
    </div>
</div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';
import {
    BIconLightbulbFill,BIconStopwatchFill, BIconGearFill, BIconWalletFill
} from 'bootstrap-icons-vue'

export default {
    props: ['node'],
    components : {BIconLightbulbFill,BIconStopwatchFill, BIconGearFill, BIconWalletFill},
    data () {
        return {
            polling: null,
        }
    },
    computed: {
        ...mapGetters('nodes',['getNodeStatus','getNetworkInfo']),
        nodeConnectedColor() {
            return this.node.connected ? 'green' : 'gray';
        },
        nodeStatusColor() {
            return !this.node.connected ? 'gray' :
            this.node.status.node_status === 4 ? 'green' :
            this.node.status.node_status === 3 ? 'orange' :
            this.node.status.node_status === 2 ? 'red' :
             'gray';
        },
        walletStatusColor() {
            return !this.node.connected ? 'gray' :
            this.node.status.wallet_status === 4 ? 'green' :
            this.node.status.wallet_status === 3 ? 'darkorange' :
            this.node.status.wallet_status === 2 ? 'red' :
             'gray';
        },
        timeStatusColor() {
            return !this.node.connected ? 'gray' :
            this.node.status.time_status === 1 ? 'red' :
            this.node.status.time_status === 2 ? 'green' :
             'gray';
        },
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
                // this.updateNetworkInfo();   
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