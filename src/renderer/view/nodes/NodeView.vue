<template>
  <div>
    <h2>Node status</h2>

    <table class="table">
      <tbody>
        <tr>
          <td>Node role:</td>
          <td class="col-6">{{ status.nodeRole }}</td>
          <td class="col-4 text-nowrap">
            <button
              class="btn btn-primary btn-sm btn-width"
              @click="changeRole(node)"
            >
              Change Role
            </button>
          </td>
        </tr>
        <tr>
          <td>Node service:</td>
          <td class="col-11">{{ status.nodeService }}</td>
          <td class="col-4 text-nowrap">
            <button
              class="btn btn-primary btn-sm btn-width"
              type="button"
              v-if="node && node.status && node.status.node_status === 2"
              @click="
                serviceAction({
                  action: 'start',
                  service: 'cardano-node',
                  node: node,
                })
              "
              :disabled="getLoading"
            >
              Start Node
            </button>
            <button
              class="btn btn-success btn-sm btn-width"
              type="button"
              v-if="node && node.status && node.status.node_status === 1"
              @click="
                serviceAction({
                  action: 'stop',
                  service: 'cardano-node',
                  node: node,
                })
              "
              :disabled="getLoading"
            >
              Stop Node
            </button>
          </td>
        </tr>
        <tr>
          <td class="text-nowrap">Wallet service:</td>
          <td colspan="2">{{ status.walletService }}</td>
        </tr>
        <tr>
          <td>Node sync:</td>
          <td colspan="2">{{ status.nodeSync }}</td>
        </tr>
        <tr>
          <td>Time sync:</td>
          <td
            colspan="2"
            :class="{
              'text-danger': status.timeSync.substring(0, 3) === 'Out',
              'text-success': status.timeSync.substring(0, 2) === 'Ok',
            }"
          >
            {{ status.timeSync }}
          </td>
        </tr>
        <tr>
          <td>OS Release:</td>
          <td colspan="2">{{node.os_release}}</td>
        </tr>
        <tr>
          <td>CPU Load:</td>
          <td>
            <div class="progress btn-width">
              <div
                class="progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                :class="{
                  'bg-success': status.cpu <= 90,
                  'bg-danger': status.cpu > 90,
                }"
                :style="{ width: status.cpu + '%' }"
              >
                {{ status.cpu }}%
              </div>
            </div>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>Memory:</td>
          <td>
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
          <td></td>
        </tr>
        <tr>
          <td>Disk:</td>
          <td>
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
          <td></td>
        </tr>
        <tr>
          <td>Tools:</td>
          <td><pre>{{node.version || "Not installed"}}</pre></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <br />
    <h2>Actions</h2>

    <div class="row">
      <span>
        <span v-if="node && !node.has_tools">Tools not installed.<br /></span>
        <button
          v-if="node && node.connected"
          :node="node"
          @click="_installNode(node)"
          :disabled="getLoading"
          class="btn btn-success btn-width"
        >
          Install Tools
        </button>
        &nbsp;
        <button
          v-if="node && node.connected"
          :node="node"
          @click="disconnect(node)"
          :disabled="getLoading"
          class="btn btn-primary btn-width"
        >
          Disconnect
        </button>
        &nbsp;
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

    <div class="row">
      <form @submit.prevent="_installNode()" v-if="need_sudo" class="row g-3">
        <div class="col-auto">
          <input
            id="sudopass"
            v-model="sudo"
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
            :disabled="getLoading"
          />
        </div>
      </form>
    </div>

    <br />
    <h2>Topology</h2>
    <table class="table">
      <thead><tr><th>Address</th><th>Port</th><th>Valency</th></tr></thead>
      <tbody>
        <tr v-for="(t, index) in node.topology['Producers'] || []" :key="index">
          <td>{{t.addr}}</td>
          <td>{{t.port}}</td>
          <td>{{t.valency}}</td>
        </tr>
      </tbody>
    </table>
    <button v-if="node && !editing_topology"
        @click="showEditTopology" :disabled="getLoading"
        class="btn btn-primary btn-width">Edit Topology</button>    
    <div v-if="editing_topology">
    <br/>
    <b>Topology File:</b>
    <br/>
    <br/>
    <form @submit.prevent="editTopology(node)">
      <div class="form-group">
          <textarea
            id="topology"
            rows="9"
            v-model="topology"
            class="form-control text-monospace"
            required
            :disabled="getLoading"
          ></textarea>
      </div>
      <div class="form-group top10">
        <input value="Save Topology"
            type="submit"
            class="btn btn-primary btn-width"
            :disabled="getLoading || !is_topology_valid"/>&nbsp;
        <button @click="editing_topology=false" 
            :disabled="getLoading || !is_topology_valid"
            class="btn btn-secondary btn-width">Cancel</button>
      </div>
      </form>
    </div>
    <br />
    <br />
    <h2>Logs</h2>
    <!-- <pre>{{node.status.logs && node.status.logs[0]}}</pre> -->
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: ["node"],
  data() {
    return {
      sudo: "",
      need_sudo: false,
      editing_topology: false,
      is_topology_valid: true,
      topology: '',
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
          }
        : {
            nodeRole: this.node.status.node_role.toUpperCase(),
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
          };
    },
  },
  mounted() {
    this.loadNode(this.node);

  },
  methods: {
    ...mapActions("nodes", [
      "loadNode",
      "updateNodeStatus",
      "disconnectNode",
      "deselectAllNodes",
      "removeNode",
      "installNode",
      "hasTools",
      "serviceAction",
      "changeRole",
      "updateTopology",
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
      if (!this.sudo) this.need_sudo = true;
      else {
        let r = await this.installNode({ node: this.node, sudo: this.sudo });
        if (r.rc === 0) this.need_sudo = false;
      }
    },  
    showEditTopology() {
      this.topology = JSON.stringify(this.node.topology, null, 2);
      this.editing_topology = true;
    },
    async editTopology(node) {
      node.topology = JSON.parse(this.topology);
      let r = await this.updateTopology(node);
      if (r.rc === 0) 
        this.editing_topology = false;       
    }, 
  },

  watch: {
    topology() {
      console.log('topology changed');
      if (this.editing_topology) {
        try {
            JSON.parse(this.topology);
            this.is_topology_valid = true;
        }
        catch {
          this.is_topology_valid = false;
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
