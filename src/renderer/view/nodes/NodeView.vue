<template>
<div>
    <h2>Node status</h2>
        <div>Node service: {{ status.nodeService }}</div>
        <div>Wallet service: {{ status.walletService }} </div>
        <div>Node sync: {{ status.nodeSync }}</div>
        <div>Time sync: <span v-html="status.timeSync"></span></div>
        <br/>
    <h2>System</h2>
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
    
    <br/>
    <h2>Actions</h2>
    
    <div class="row">
      <span>
        <span v-if="node && !node.has_tools">Tools not installed.<br/></span>
        <button v-if="node && node.connected" :node="node" 
          @click="setup(node)"
          :disabled="getLoading"
          class="btn btn-success btn-width" >Install Tools</button>
          &nbsp;
        <button v-if="node && node.connected" :node="node" 
          @click="disconnect(node)"
          :disabled="getLoading"
          class="btn btn-primary btn-width" >Disconnect</button>
          &nbsp;
        <button v-if="node && node.connected" :node="node"  
          @click="remove(node)"
          :disabled="getLoading"
          class="btn btn-danger btn-width" >Remove</button>
          &nbsp;
      </span>
    </div>
  
</div>
</template>

<script>

import {mapGetters, mapActions} from 'vuex';

export default {
    props: ['node'],
    data () {
        return {
       }
    },
    computed: {
        ...mapGetters('nodes',['getNodeStatus','getLoading']),
        
        status() {
            return !this.node.status ? {
                nodeService: 'n/a',
                walletService: 'n/a',
                nodeSync: 'n/a',
                timeSync: 'n/a',
                disk: 'n/a',
                memory: 'n/a',
                cpu: 'n/a',
            } : {
                nodeService: this.node.status.node_status === 1 ? 'Running' 
                             : this.node.status.node_status === 2 ? 'Stopped'
                             : 'Not installed',
                walletService: this.node.status.wallet_status === 1 ? 'Running'
                             : this.node.status.wallet_status === 2 ? 'Stopped'
                             : 'Not installed',
                nodeSync: this.node.status.node_sync ? this.node.status.node_sync +'%' : 'n/a',  
                timeSync: this.node.status.time_sync === 1 ? 'Ok'
                             :`Out of sync:<br/>Network: ${this.node.status.network_time}<br/>Node: ${this.node.status.node_time}`,
                disk: Math.round(this.node.status.disk[0]/this.node.status.disk[1] * 100),
                memory: Math.round(this.node.status.memory[0]/this.node.status.memory[1] * 100),
                cpu: Math.round(this.node.status.cpu * 100),
            
            }
        },
    },
    methods: {
        ...mapActions('nodes',['updateNodeStatus',
            'disconnectNode','deselectAllNodes','removeNode',
            'setupNode','hasTools'
        ]),
    
        disconnect(node) {
            this.deselectAllNodes();
            this.disconnectNode(node);
        },
        setup(node) {
            this.setupNode(node);
        },
        remove(node) {
            this.deselectAllNodes();
            this.removeNode(node);
        }
    },
}
</script>

<style scoped>

</style>