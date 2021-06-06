<template>
  <div>
    <div class="d-flex justify-content-between subtitle" >
      <div>Status</div>
      <!-- <span>
      <button @click="_updateTopology" :disabled="getLoading"
        class="btn btn-sm btn-secondary btn-width">Actions</button>          
        </span> -->
    </div>
    
    <table class="table">
      <tbody>
        <tr><td class="title">Connection:</td>
            <td class="icon" style="width: 30px">
              <StatusIcon :status="node.connected ? 1 : 2"/></td>
            <td class="fill">
              {{ node.connected ? 'Connected' : 'Disconnected' }}</td>
            <td><button v-if="!node.connected"
                  class="btn btn-success btn-sm btn-width"
                  @click="connectNode(node)">Connect</button>
                <button v-if="node.connected"
                  class="btn btn-light btn-sm btn-width"
                  @click="disconnect(node)">Disconnect</button></td>
        </tr>
       
        <tr><td class="title">SSH Auth:</td>
            <td class="icon"><StatusIcon :status="node.ssh_auth ? 1 : 2"/></td>
            <td class="fill"></td>
            <td>
              <!-- <button class="btn btn-primary btn-sm btn-width"
                @click="setupSsh(node)">Setup SSH</button> -->
            </td>
        </tr>
        
        <tr><td class="title">Tools:</td>
          <td class="icon"><StatusIcon :status="node.has_tools ? 1 : node.tools_version && 
          node.tools_version.need_update ? 2 : 0"/></td>
          <td class="fill">
            <div v-if="typeof(node.version) === 'object'" >
            <div v-for="(v,k) in node.version"  :key="k">
                  {{k}}: {{v}}
            </div>
            </div>
            </td>
          <td>
            <!-- <pre>{{node.tools_version}}</pre> -->
            <button v-if="node.tools_version && node.tools_version.need_update"
              class="btn btn-sm btn-width"
              :class="{'btn-primary': node.has_tools, 'btn-success': !node.has_tools}"
              :disabled="need_sudo || getLoading"
              @click="_installNode">Install</button>
              <br/>
              <div v-if="node.tools_version && node.tools_version.need_update">Update available</div>
          </td>
        </tr>
        <template v-if="need_sudo">
        <tr><td colspan="4">
          <form @submit.prevent="_installNode" v-if="need_sudo" class="row g-3">
          <div class="col-auto">
            <input
              id="sudo_pass"
              v-model="sudo_pass"
              placeholder="sudo password"
              type="password"
              class="form-control"
              required
              :disabled="getLoading"
            />
          </div>
          <div class="col-auto top10">
            <input
              value="Ok"
              type="submit"
              class="btn btn-primary btn-width"
              :disabled="getLoading" /> &nbsp;
            <button @click="need_sudo=false" 
              :disabled="getLoading"
              class="btn btn-light btn-width">Cancel</button>
          </div>
        </form>
        </td></tr>
        </template>

        <tr><td class="title">Node service:</td>
          <td class="icon">
            <StatusIcon 
              :status="status.nodeService === 'Running' ? 1 :
                       status.nodeService === 'Stopped' ? 2 : 0"/></td>
          <td class="fill">{{ status.nodeService }}</td>
          <td class="action">
            <button class="btn btn-primary btn-sm btn-width"  type="button"
              v-if="node && node.status && node.status.node_status === 2"
              @click="serviceAction({
                  action: 'start',
                  service: 'cardano-node',
                  node: node})"
              :disabled="getLoading">Start Node</button>
            <button class="btn btn-success btn-sm btn-width" type="button"
              v-if="node && node.status && node.status.node_status === 1"
              :disabled="getLoading"
              @click=" serviceAction({
                  action: 'stop',
                  service: 'cardano-node',
                  node: node,
                })">Stop Node</button></td>
        </tr>

        <tr><td class="title">Wallet service:</td>
          <td class="icon">
            <StatusIcon 
              :status="status.walletService === 'Running' ? 1 :
                       status.walletService === 'Stopped' ? 2 : 0"/></td>
          <td class="fill">{{ status.walletService }}</td>
          <td class="action">
            <button class="btn btn-primary btn-sm btn-width"  type="button"
              v-if="node && node.status && node.status.wallet_status === 2"
              @click="serviceAction({
                  action: 'start',
                  service: 'cardano-wallet',
                  node: node})"
              :disabled="getLoading">Start Wallet</button>
            <button class="btn btn-success btn-sm btn-width" type="button"
              v-if="node && node.status && node.status.wallet_status === 1"
              :disabled="getLoading"
              @click=" serviceAction({
                  action: 'stop',
                  service: 'cardano-wallet',
                  node: node,
                })">Stop Wallet</button></td>
        </tr>

        <tr><td class="title">Role:</td>
          <td class="icon">
            <StatusIcon :status="status.nodeRole !== 'N/A' ? 1 : 0"/></td>
          <td class="fill">{{ status.nodeRole }}</td>
          <td class="action">
            <button class="btn btn-primary btn-sm btn-width"
              @click="changeRole(node)">Change Role</button></td>
        </tr>

        <template v-if="status.nodeRole === 'PRODUCER'">
        <tr><td class="title">Processed TX:</td>
          <td class="icon">
            <StatusIcon :status="status.processed_tx > 0 ? 1 : 2"/></td>
          <td class="fill" colspan="2">  
            TX: {{status.processed_tx}} &nbsp; Mempool TX/Bytes: {{status.mempool_tx}}/{{status.mempool_bytes}} 
          </td>
        </tr>
        </template>

        <tr><td class="title">Peers IN:</td>
          <td class="icon">
            <StatusIcon 
            :status="status.peers_in.length ? 1 : 2"/></td>
          <td class="fill" colspan="2">  
            <table v-if="status.peers_in.length" 
              class="table table-condensed borderless m-0">   
              <tbody>       
            <tr v-for="(v,i) in status.peers_in"  :key="i">
              <td class="p-0">{{v[1]}}</td><td class="fill">{{v[3]}} {{v[4]}}</td>              
            </tr>
            </tbody>
            </table>
          </td>
        </tr>

        <tr><td class="title">Peers OUT:</td>
          <td class="icon">
            <StatusIcon 
            :status="status.peers_out.length ? 1 : 2"/></td>
          <td class="fill" colspan="2">  
            <table v-if="status.peers_out.length" 
              class="table table-condensed borderless m-0">   
              <tbody>       
            <tr v-for="(v,i) in status.peers_out"  :key="i">
              <td class="p-0">{{v[1]}}</td><td class="fill">{{v[3]}} {{v[4]}}</td>              
            </tr>
            </tbody>
            </table>
          </td>
        </tr>

        <tr><td class="title">DB Sync:</td>
          <td class="icon">
            <StatusIcon 
              :status="status.nodeSync === '100%' ? 1 : 0"/></td>
          <td class="fill">{{ status.nodeSync }}</td>
          <td class="action"></td>
        </tr>

        <tr><td class="title">Time Sync:</td>
          <td class="icon">
            <StatusIcon 
              :status="status.timeSync.substring(0, 2) === 'Ok' ? 1 :
                    status.timeSync.substring(0, 3) === 'Out' ? 2 : 0"/></td>
          <td colspan="2" class="fill" 
            :class="{
               'text-danger': status.timeSync.substring(0, 3) === 'Out',
                'text-success': status.timeSync.substring(0, 2) === 'Ok',
              }">{{ status.timeSync }}</td>
        </tr>

        <tr><td class="title">CPU Load:</td>
            <td class="fill" colspan="3">
              <div class="progress btn-width">
                <div class="progress-bar"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :style="{ width: status.cpu + '%' }"
                  :class="{
                    'bg-success': status.cpu <= 90,
                    'bg-danger': status.cpu > 90,
                  }"               
                >{{ status.cpu }}%</div></div></td>
        </tr>
        
        <tr><td class="title">Memory:</td>
          <td class="fill" colspan="3">
            <div class="progress btn-width">
              <div
                class="progress-bar"
                role="progressbar"
                aria-valuenow="25"
                aria-valuemin="0"
                aria-valuemax="100"
                :class="{
                  'bg-success': status.memory <= 90,
                  'bg-danger': status.memory > 90,
                }"
                :style="{ width: status.memory + '%' }"
              >
                {{ status.memory }}%
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="title">Disk:</td>
          <td class="fill" colspan="3">
            <div class="progress btn-width">
              <div
                class="progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                :class="{
                  'bg-success': status.disk <= 75,
                  'bg-warning': status.disk > 75 && status.disk <= 100,
                  'bg-danger': status.disk > 100,
                }"
                :style="{ width: status.disk + '%' }"
              >
                {{ status.disk }}%
              </div>
            </div>
          </td>
        </tr>

        <tr><td class="title">OS Release:</td>
            <td colspan="3">{{node.os_release}}</td></tr>

      </tbody>
    </table>
    
    <br />
    <div class="d-flex justify-content-between subtitle" >
      <div>Topology</div>
      <span>
        <button 
          v-if="topology.is_editing"
          @click="topology_json=topology_default" 
          :disabled="getLoading"
          type="button"
          class="btn btn-sm btn-primary btn-width">Default</button>&nbsp;
        <input 
          v-if="topology.is_editing"
          value="Save" type="submit" form="form-topology"
          class="btn btn-sm btn-success btn-width"
          :disabled="getLoading || !topology.is_valid"/>&nbsp;
        <button 
          v-if="topology.is_editing"
          @click="topology.is_editing=false" 
          :disabled="getLoading || !topology.is_valid"
          type="button"
          class="btn btn-sm btn-light btn-width">Cancel</button>
      <button v-if="!topology.is_editing"  
        @click="_updateTopology" :disabled="getLoading"
        class="btn btn-sm btn-primary btn-width">Change</button>          
      </span>
    </div>
    <table v-if="node.topology && !topology.is_editing" class="table" >
      <thead><tr><th>Address</th><th>Port</th><th>Valency</th></tr></thead>
      <tbody>
        <tr v-for="(t, index) in node.topology['Producers'] || []" :key="index">
          <td>{{t.addr}}</td>
          <td>{{t.port}}</td>
          <td>{{t.valency}}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="topology.is_editing">
      <br/>
      <form id="form-topology" @submit.prevent="_updateTopology">    
        <div class="form-group top10">
            <textarea
              id="topology"
              spellcheck="false"
              rows="9"
              v-model="topology_json"
              class="form-control"
              required
              :disabled="getLoading"
            ></textarea>
        </div>
        <div class="text-danger">{{topology.error}}</div>
      </form>
   </div>
   
    
    <br />
    <br />
    <div class="d-flex justify-content-between subtitle" >
      <div>Logs</div>
    </div>
    
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Time</th>
          <th scope="col">Level</th>
          <th scope="col">Kind</th>
          <th scope="col">Data</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(t, index) in node.status.logs || []"
          :key="index"
          class="fs-7"
        >
          <td>{{ t.at }}</td>
          <td>{{ t.sev }}</td>
          <td class="text-break kind-width">{{ t.data && t.data.kind }}</td>
          <td class="text-break">{{ t.data }}</td>
        </tr>
      </tbody>
    </table>
  
    <br />
    <h2>Actions</h2>

    <div class="row">
      <span>
        <button
          v-if="node && node.connected"
          :node="node"
          @click="remove(node)"
          :disabled="getLoading"
          class="btn btn-danger btn-width"
        >
          Remove
        </button>
        &nbsp;
      </span>
    </div>


  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import StatusIcon from '../common/StatusIcon'

export default {
  props: ["node"],
  components: {StatusIcon},
  data() {
    return {
      sudo_pass: "",
      need_sudo: false,
      topology_json: '',
      topology: {
        is_editing: false,
        is_valid: true,
        json: '',
        error: '',
      },      
    };
  },
  computed: {
    ...mapGetters("nodes", ["getNodeStatus"]),
    ...mapGetters(["getLoading"]),
    status() {
      return !this.node || !this.node.status || !this.node.status.node_status
        ? {
            nodeRole: "N/A",
            nodeService: "N/A",
            walletService: "N/A",
            nodeSync: "N/A",
            timeSync: "N/A",
            disk: 0,
            memory: 0,
            cpu: 0,
            processed_tx: 0,
            mempool_tx: 0,
            mempool_bytes: 0,
            peers_in : [],
            peers_out: [],
          }
        : {
            nodeRole: this.node.status.role.toUpperCase(),
            nodeService:
              this.node.status.node_status === 1
                ? "Running"
                : this.node.status.node_status === 2
                ? "Stopped"
                : "Not installed",
            walletService:
              this.node.status.wallet_status === 1
                ? "Running"
                : this.node.status.wallet_status === 2
                ? "Stopped"
                : "Not installed",
            nodeSync: this.node.status.node_sync
              ? this.node.status.node_sync + "%"
              : "N/A",
            timeSync:
              this.node.status.time_sync === 1
                ? "Ok"
                : this.node.status.time_sync === 2
                ? `Out of sync, time diff: ${this.node.status.time_diff} seconds`
                : "N/A",
            disk: Math.round(
              (this.node.status.disk[0] / this.node.status.disk[1]) * 100
            ),
            memory: Math.round(
              (this.node.status.memory[0] / this.node.status.memory[1]) * 100
            ),
            cpu: Math.round(this.node.status.cpu * 100),
            processed_tx: this.node.metrics ? this.node.metrics['txsProcessedNum'] : 0,
            mempool_tx: this.node.metrics ? this.node.metrics['txsInMempool'] : 0,
            mempool_bytes: this.node.metrics ? this.node.metrics['mempoolBytes'] : 0,
            peers_in : Array.isArray(this.node.peers) && this.node.peers.filter(x=>x[0]==='IN'),
            peers_out : Array.isArray(this.node.peers) && this.node.peers.filter(x=>x[0]==='OUT'),
          
          };
    },
    topology_default() {
      return JSON.stringify(this.node.topology_default, null, 2);
    }
  },
  mounted() {
    this.loadNode(this.node);
    this.checkVersion(this.node)

  },
  methods: {
    ...mapActions("nodes", [
      "loadNode",
      "connectNode",
      "setupSsh",
      "updateNodeStatus",
      "disconnectNode",
      "deselectAllNodes",
      "removeNode",
      "installNode",
      "hasTools",
      "serviceAction",
      "changeRole",
      "updateTopology",
      "checkVersion",
    ]),

    disconnect(node) {
      this.deselectAllNodes();
      this.disconnectNode(node);
    },
    remove(node) {
      this.deselectAllNodes();
      this.removeNode(node);
    },
    async _installNode() {
      if (!this.sudo_pass) this.need_sudo = true;
      else {
        let r = await this.installNode({ node: this.node, sudo: this.sudo_pass });
        if (r.rc === 0) this.need_sudo = false;
      }
    },  
    async _updateTopology() {
      //console.log('updating topology');
      if (!this.topology.is_editing) {
        this.topology_json = JSON.stringify(this.node.topology, null, 2);
        this.topology.is_editing = true;
      } else {
        let topology = JSON.parse(this.topology_json);
        let r = await this.updateTopology({node: this.node, topology: topology});
        if (r.rc === 0) 
          this.topology.is_editing = false;       
      }
    },
  },

  watch: {
    topology_json() {
        if (this.topology.is_editing) {
          try {
              JSON.parse(this.topology_json);
              this.topology.is_valid = true;
              this.topology.error = '';
          }
          catch(e) {
            this.topology.is_valid = false;
            this.topology.error = "Invalid JSON: "+ JSON.stringify(e.message);
          }
      }
    }
  }
};
</script>

<style scoped>
.kind-width {
  width: 10rem;
}
.fs-7 {
  font-size: 14px;
}
.active {
  background: rgb(240, 240, 240);
}
pre {
  white-space: pre-wrap;
}
</style>
