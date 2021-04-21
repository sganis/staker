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
        ...mapGetters('nodes',['getNodeStatus']),
        nodeConnectedColor() {
            return this.node && this.node.connected ? 'green' : 'gray';
        },
        nodeStatusColor() {
            return this.node && !this.node.connected ? 'gray' :
            this.node && this.node.status && this.node.status.node_status === 1 ? 'green' :
            this.node && this.node.status && this.node.status.node_status === 2 ? 'red' :
             'gray';
        },
        nodeSyncColor() {
            return this.node && !this.node.connected ? 'gray' :
            this.node && this.node.status && this.node.status.node_sync === 100 ? 'green' :
            this.node && this.node.status && this.node.status.node_sync > 0 ? 'red' :
             'gray';
        },
        walletStatusColor() {
            return this.node && !this.node.connected ? 'gray' :
            this.node && this.node.status && this.node.status.wallet_status === 1 ? 'green' :
            this.node && this.node.status && this.node.status.wallet_status === 2 ? 'red' :
             'gray';
        },
        timeStatusColor() {
            return this.node && !this.node.connected ? 'gray' :
            this.node && this.node.status && this.node.status.time_sync === 1 ? 'green' :
            this.node && this.node.status && this.node.status.time_sync === 2 ? 'red' :
             'gray';
        },
    },
    methods: {
        ...mapActions('nodes',['updateNodeStatus']),
        pollData() {
            this.polling = setInterval(() => {
                this.updateNodeStatus(this.node);      
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