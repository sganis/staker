<template>
<div>
    <div class="d-flex justify-content-between subtitle" >
      <div>Pool Summary</div>
      <span></span>
    </div>
    <table class="table">
        <tbody>
        <tr><td>ID</td>
            <td class="text-break">{{ pool.id }}</td></tr>
        <tr><td>Status</td>
            <td>{{(pool.params && pool.params.poolParams) && "Registered" || "Not registered"}}</td></tr>
        </tbody>
    </table>    

    <br/>
    <br/>
    <div class="d-flex justify-content-between subtitle" >
      <div>Relay Nodes</div>
      <span>
        <input 
          v-if="relay.is_editing" 
          value="Save"  type="submit" form="form-relay-nodes"
          class="btn btn-sm btn-success btn-width"
          :disabled="getLoading || !relay.is_valid"/>&nbsp;
        <button 
          v-if="relay.is_editing"
          @click="relay.is_editing=false" 
          :disabled="getLoading || !relay.is_valid"
          class="btn btn-sm btn-light btn-width">Cancel</button>
        <button v-if="!relay.is_editing"  
          @click="_updateRelayNodes" :disabled="getLoading"
          class="btn btn-sm btn-primary btn-width">Change</button>          
        </span>
    </div>
    <table  v-if="!relay.is_editing" class="table" >
        <thead>
          <tr><th>Address</th><th>Port</th></tr>
        </thead>
        <tbody>
        <tr v-for="(v,k,i) in pool.relay_nodes || []" :key="i">
          <td>{{v.ip}}</td><td>{{v.port}}</td></tr>
        </tbody>
    </table>    
    <div v-if="relay.is_editing">
      <br/>
      <form id="form-relay-nodes" @submit.prevent="_updateRelayNodes">
        <div class="form-group top10"
          v-for="(v,k,i) in pool.relay_nodes || []" :key="i">
          <input type="checkbox" v-model="v.ip" />
          <label :for="v.ip">{{v.ip}}</label>
        </div>
        <div class="text-danger">{{relay.error}}</div>
      </form>
    </div>
    
    <br/>
    <br/>
    <div class="d-flex justify-content-between subtitle" >
      <div>Metadata</div>
      <span>
        <button 
          v-if="!metadata.is_editing"
          @click="_updateMetadata" :disabled="getLoading"
          class="btn btn-sm btn-primary btn-width">Change</button>    
        <input 
          v-if="metadata.is_editing"
          value="Save" type="submit" form="form-metadata"
          class="btn btn-sm btn-success btn-width"
          :disabled="getLoading || !metadata.is_valid"/>&nbsp;
        <button 
          v-if="metadata.is_editing"
          @click="metadata.is_editing=false" 
          :disabled="getLoading || !metadata.is_valid"
          class="btn btn-sm btn-light btn-width">Cancel</button>
      </span>
    </div>
    <table v-if="!metadata.is_editing" class="table">
        <tbody>
        <tr><td class="title">Json</td>
            <td>
              <table class="table table-condensed borderless">
                <tbody>
                <tr v-for="(v,k) in pool.metadata" :key="k">
                  <td>{{k}}:</td><td class="fill">{{v}}</td></tr>
                </tbody>
              </table>
            </td></tr>
        <tr><td  class="title">Hash</td>
            <td>{{ pool.metadata_hash }}</td></tr>
        <tr><td class="title">Url</td>
            <td>{{pool.metadata_url}}</td></tr>
        </tbody>
    </table>    
    <div v-if="metadata.is_editing">
      <form id="form-metadata" @submit.prevent="_updateMetadata">
        <div class="form-group top10">
            <textarea
              id="metadata_json"
              spellcheck="false"
              rows="6"
              v-model="metadata_json"
              class="form-control monospace"
              required
              :disabled="getLoading"
            ></textarea>
        </div>
        <div class="form-group top10">
            <input id="metadata_url"
              v-model="metadata.url"
              class="form-control"
              placeholder="Url"
              required
              :disabled="getLoading"/>
        </div>
        <div class="text-danger">{{metadata.error}}</div>
      </form>
    </div>
    
    <br/>
    <br/>
    <div class="d-flex justify-content-between subtitle" >
      <div>Keys</div>
      <span>
        <button 
          v-if="!keys.is_editing"
          @click="_newKey" :disabled="getLoading"
          class="btn btn-sm btn-primary btn-width">Generate</button>    
        <button
          v-if="keys.is_editing"
          @click="_newKey({ pool: pool, type: keys.keygen_list })"
          :disabled="getLoading || keys.keygen_list.length === 0"
          class="btn btn-sm btn-success btn-width">Generate</button>&nbsp;
        <button 
          v-if="keys.is_editing"
          @click="keys.is_editing=false" 
          :disabled="getLoading || !metadata.is_valid"
          class="btn btn-sm btn-light btn-width">Cancel</button>
      </span>
    </div>
    <div v-if="keys.is_editing" :disabled="getLoading" class="m-4" >
        <form>
          <div class="form-check form-check-inline top10">
            <input
              class="form-check-input"
              type="checkbox"
              :disabled="getLoading"
              id="cold"
              value="cold"
              v-model="keys.keygen_list"
            />
            <label class="form-check-label" for="cold">Cold keys</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              :disabled="getLoading"
              id="vrf"
              value="vrf"
              v-model="keys.keygen_list"
            />
            <label class="form-check-label" for="vrf">VFR keys</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              :disabled="getLoading"
              id="kes"
              value="kes"
              v-model="keys.keygen_list"
            />
            <label class="form-check-label" for="kes">KES keys</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              :disabled="getLoading"
              id="cert"
              value="cert"
              v-model="keys.keygen_list"
            />
            <label class="form-check-label" for="cert"
              >Operational certificate</label
            >
          </div>
        </form>
    </div>
    <table class="table">
      <thead><tr><th class="col-8">File</th><th class="col-1 text-nowrap">Created (days ago)</th></tr></thead>
      <tbody>
          <tr
            v-for="(k, index) in pool.keys || []"
            :key="index"
            class="fs-7"
            @click="k.visible = !k.visible"
            @mouseover="k.hover = true"
            @mouseleave="k.hover = false"
            :class="{ active: k.hover }">
            <td colspan="2">
              <div class="d-flex justify-content-between">
                <div  class="text-nowrap">
                <StatusIcon :status="k.mtime !== 'N/A' ? 1 : 2" />
                  &nbsp;
                  {{ k.name }}
                  </div>
                <div class="text-nowrap">{{ k.days }}</div>
              </div>
              <div class="row text-break" v-if="k.visible">
                <pre class="text-break">{{ k.content }}</pre>
              </div>
            </td>
          </tr>
        </tbody>
    </table>

    <br/>
    <br/>
    <div class="d-flex justify-content-between subtitle" >
      <div>Wallets</div>
      <span>
        <button 
          v-if="!wallets.is_editing"
          @click="_updatePoolWallet" :disabled="getLoading" 
          class="btn btn-sm btn-primary btn-width" >Change</button>
        <input 
          v-if="wallets.is_editing"
          value="Save"  type="submit" form="form-wallets"
          class="btn btn-sm btn-success btn-width"
          :disabled="getLoading"/>&nbsp;
        <button 
          v-if="wallets.is_editing"
          @click="wallets.is_editing=false" 
          :disabled="getLoading"
          class="btn btn-sm btn-light btn-width">Cancel</button>
        </span>
    </div>    
    <div v-if="wallets.is_editing">
      <form id="form-wallets">
      </form>
    </div>


    <br/>
    <br/>
    <div class="d-flex justify-content-between subtitle" >
      <div>Registration</div>
      <span>
        <button 
          v-if="!registration.is_editing"
          @click="_register" :disabled="getLoading" 
          class="btn btn-sm btn-primary btn-width" >Register</button>
        <input 
          v-if="registration.is_editing"
          value="Save"  type="submit" form="form-registration"
          class="btn btn-sm btn-success btn-width"
          :disabled="getLoading"/>&nbsp;
        <button 
          v-if="registration.is_editing"
          @click="registration.is_editing=false" 
          :disabled="getLoading"
          class="btn btn-sm btn-light btn-width">Cancel</button>
        </span>
    </div>    
    <div v-if="registration.is_editing">
      <form id="form-registration" @submit.prevent="_register">
      <table class="table">
          <tbody>
          <tr><td>ID</td>
              <td class="text-break">{{ pool.id }}</td></tr>
          <tr><td>Status</td>
              <td>{{(pool.params && pool.params.poolParams) && "Registered" || "Not registered"}}</td></tr>
          <tr><td>Relay nodes</td>
              <td><ol>
              <li v-for="(r,index) in form.relay_nodes || []" :key="index">
              </li>
              </ol>
              </td></tr>
          <tr><td>Rewards</td>
              <td><select v-model="form.stake_wallet_id" class="form-select">
                  <option v-for="w in form.wallets || []" :value="w" :key="w">
                  {{ w }}
                  </option>
                  </select></td></tr>
          <tr><td>Owner</td>
              <td><select v-model="form.owner_wallet_id" class="form-select">
                  <option v-for="w in form.wallets || []" :value="w" :key="w">
                  {{ w }}
                  </option>
                  </select></td></tr>
          <tr><td>Pledge</td>
              <td><input id="pledge" v-model="form.pledge" placeholder="Pledge" 
                  class="form-control" required :disabled="getLoading"/>
              </td></tr>
          <tr><td>Cost</td>
              <td><input id="cost" v-model="form.cost" placeholder="Cost" 
                  class="form-control" required :disabled="getLoading"/>
              </td></tr>
          <tr><td>Margin</td>
              <td><input id="margin" v-model="form.margin" placeholder="Margin" 
                  class="form-control" required :disabled="getLoading"/>
              </td></tr>
          </tbody>
      </table>    
      </form>
    </div>
    
    <br/>
    <br/>
    <div class="d-flex justify-content-between subtitle" >
      <div>Data on chain</div>
    </div>
    <table class="table">
        <tbody>
        <template v-if="pool.params && pool.params.poolParams">
        <tr><td>Pledge</td>
            <td>{{pool.params && pool.params.poolParams.pledge/1000000}}</td></tr>
        <tr><td>Margin</td>
            <td>{{pool.params && `${pool.params.poolParams.margin*100}%`}}</td></tr>
        <tr><td>Cost</td>
            <td>{{pool.params && `${pool.params.poolParams.cost/1000000} ADA`}}</td></tr>
        <tr><td>Relays</td>
            <td>{{pool.params && pool.params.poolParams.relays}}</td></tr>
        <tr><td>Rewards</td>
            <td>{{pool.params && pool.params.poolParams.rewardAccount}}</td></tr>
        <tr><td>Owners</td>
            <td>{{pool.params && pool.params.poolParams.owners}}</td></tr>
        <tr><td class="text-nowrap">Metadata hash</td>
            <td>{{pool.params && pool.params.poolParams.metadata.hash}}</td></tr>
        <tr><td>Metadata url</td>
            <td>{{pool.params && pool.params.poolParams.metadata.url}}</td></tr>
        </template>
        </tbody>
    </table>
    

    <b>Raw Pool Params</b>   
    <pre class="text-break">{{pool.params}}</pre>
    
    <!-- <b>Stake snapshot:</b>
    <pre class="text-break">{{pool.stake_snapshot}}</pre> -->

</div>
</template>

<script>

import {mapGetters, mapActions} from 'vuex';
import StatusIcon from '../common/StatusIcon'

export default {
    props: ['pool'],
    components: {StatusIcon},
    data () {
        return {
          registration : {
            is_editing: false,
            is_valid: true,
            error: '',
          },
          relay: {
            is_editing: false,
            is_valid: true,
            relay_nodes: [],
          },
          metadata_json: '', // needed to validate json on change
          metadata: {
            is_editing: false,
            is_valid: true,
            json: '',
            url: '',
            error: '',
          },
          keys : {
            keygen_list: [],
            is_editing: false,
          },
          wallets: {
            is_editing: false,
            is_valid: true,
            stake: '',
            owners: [],
          },
        }
    },
    computed: {
        ...mapGetters(['getLoading']),
        ...mapGetters('pools',['getPoolStatus']),
    },
    mounted() {
        this.loadPool(this.pool);
    },
    methods: {
        ...mapActions('pools',['loadPool','register','newKey',
              'updateMetadata','updateRelayNodes']),
        
        async _newKey(args) {
          if (!this.keys.is_editing) {
            this.keys.is_editing = true;
          } else {
            let r = await this.newKey(args);
            if (r.rc === 0) {
                this.keys.keygen_list = [];
                this.keys.is_editing = false;
            }
          }
        },
        async _updateMetadata() {
          //console.log('updating metadata');
          if (!this.metadata.is_editing) {
            this.metadata_json = JSON.stringify(this.pool.metadata, null, 2);
            this.metadata.url = this.pool.metadata_url;
            this.metadata.is_editing = true;
          } else {
            let r = await this.updateMetadata({
              pool: this.pool, 
              metadata: JSON.parse(this.metadata_json),
              url: this.metadata.url
            });
            if (r.rc === 0) 
              this.metadata.is_editing = false;       
          }
        },
        async _updateRelayNodes() {
          //console.log('updating metadata');
          if (!this.relay.is_editing) {
            this.relay.nodes = this.pool.metadata.relay_nodes;
            this.relay.is_editing = true;
          } else {
            let r = await this.updateRelayNodes({
              pool: this.pool, 
              relay_nodes: this.relay.nodes
            });
            if (r.rc === 0) 
              this.relay.is_editing = false;       
          }
        },
        async _register() {
          if (!this.registration.is_editing) {
            this.registration.is_editing = true;
          } else {

            let r = await this.register(this.pool);
            if (r.rc === 0) {
                this.registration.is_editing = false;
            }
          }
        },
        
    },
    watch : {
        metadata_json() {
          if (this.metadata.is_editing) {
          try {
              JSON.parse(this.metadata_json);
              this.metadata.is_valid = true;
              this.metadata.error = '';
          }
          catch(e) {
            this.metadata.is_valid = false;            
            this.metadata.error = "Invalid JSON: "+JSON.stringify(e.message);            
          }
        }
      }
    }
}
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