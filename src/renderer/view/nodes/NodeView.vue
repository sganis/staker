<template>
<div>
    <!-- <pre> {{ getNetworkInfo }}</pre> -->
    <h2>Node status</h2>
    <!-- <Progress :percent="netinfo.sync_progress"/> -->
        <div>Node service: {{ node && node.status && node.status.node_status }}</div>
        <div>Wallet service: {{ node && node.status && node.status.wallet_status }} </div>
        <div>DB sync: {{ node && node.status && node.status.node_sync }}<br/>
                <!-- Epoch: {{ netinfo.node_epoch }}/{{ netinfo.network_epoch }}<br/> -->
                <!-- Slot: {{ netinfo.node_slot }}/{{ netinfo.network_slot }} -->
        </div>
        <div>Time sync: {{ node && node.status && node.status.time_sync }}</div>
        
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