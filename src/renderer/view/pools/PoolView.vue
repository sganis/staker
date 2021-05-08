<template>
<div>
    <h2>Pool Summary</h2>
    <table class="table">
        <tbody>
        <tr><td>ID</td>
            <td class="text-break">{{ pool.id }}</td></tr>
        <tr><td>Status</td>
            <td>{{(pool.params && pool.params.poolParams) && "Registered" || "Not registered"}}</td></tr>
        </tbody>
    </table>    

    <h2>Relay Nodes</h2>
    <table class="table">
        <thead>
            <tr><th>Address</th><th>Port</th></tr>
        </thead>
        <tbody>
        <tr><td></td>
            <td></td></tr>
        </tbody>
    </table>    

    <h2>Metadata</h2>
    <div v-if="!metadata.is_editing" class="d-flex justify-content-end">
      <button  @click="_updateMetadata" :disabled="getLoading"
        class="btn btn-sm btn-primary btn-width">Change</button>    
    </div>
    <table v-if="!metadata.is_editing" class="table">
        <tbody>
        <tr><td class="title">Json</td>
            <td>
              <table class="table">
                <tr v-for="(v,k) in pool.metadata" :key="k">
                  <td>{{k}}:</td><td>{{v}}</td></tr>
              </table>
            </td></tr>
        <tr><td  class="title">Hash</td>
            <td>{{ pool.metadata_hash }}</td></tr>
        <tr><td class="title">Url</td>
            <td>{{pool.metadata_url}}</td></tr>
        </tbody>
    </table>    
    <div v-if="metadata.is_editing">
      <form @submit.prevent="_updateMetadata">
        <div class="form-group d-flex justify-content-end">
        <input value="Save"
              type="submit"
              class="btn btn-sm btn-success btn-width"
              :disabled="getLoading || !metadata.is_valid"/>&nbsp;
          <button @click="metadata.is_editing=false" 
              :disabled="getLoading || !metadata.is_valid"
              class="btn btn-sm btn-light btn-width">Cancel</button>
        </div>
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
    <h2>Keys</h2>
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
    <h5>Generate new keys:</h5>
    <br />
    <div class="row" :disabled="getLoading">
        <form>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              :disabled="getLoading"
              id="cold"
              value="cold"
              v-model="keygen_list"
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
              v-model="keygen_list"
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
              v-model="keygen_list"
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
              v-model="keygen_list"
            />
            <label class="form-check-label" for="cert"
              >Operational certificate</label
            >
          </div>
        </form>
    </div>
    <br />
    <div class="row">
        <span>
          <button
            @click="_newKey({ pool: pool, type: keygen_list })"
            :disabled="getLoading || keygen_list.length === 0"
            class="btn btn-primary"
          >
            Generate
          </button>
        </span>
    </div>

    <br/>    
    <br/>
    <h2>Registration</h2>
    <button @click="registering=true" :disabled="getLoading" 
        v-if="!registering"
        class="btn btn-primary btn-width"  >Register</button>
    
    <div v-if="registering">
    <form @submit.prevent="register">
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
    
        
        <br/>
        <br/>
        <button @click="_register()" :disabled="getLoading" 
            class="btn btn-primary btn-width"  >Submit</button>
            &nbsp;
        <button @click="registering=false" :disabled="getLoading" 
            class="btn btn-secondary btn-width"  >Cancel</button>
    </div>
    
    <br/>
    <br/>
    <h1>Data on chain</h1>   
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
          keygen_list: [],
          registering: false,
          metadata_json: '',
          metadata: {
            is_editing: false,
            is_valid: true,
            json: '',
            url: '',
            error: '',
          }
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
        ...mapActions('pools',['loadPool','register','newKey','updateMetadata']),
        async _register() {
            let r = await this.register(this.form);
            // if (r.rc === 0) {
                
            // }
        },
        async _newKey(args) {
            let r = await this.newKey(args);
            if (r.rc === 0) {
                this.keygen_list = [];
            }
        },
        async _updateMetadata() {
          //console.log('updating metadata');
          if (!this.metadata.is_editing) {
            this.metadata_json = JSON.stringify(this.pool.metadata, null, 2);
            this.metadata.url = this.pool.metadata_url;
            this.metadata.is_editing = true;
          } else {
            let metadata = JSON.parse(this.metadata_json);
            let r = await this.updateMetadata({pool: this.pool, metadata: metadata});
            if (r.rc === 0) 
              this.metadata.is_editing = false;       
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