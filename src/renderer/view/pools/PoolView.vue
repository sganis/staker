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
            <tr><th>DNS</th><th>IP</th><th>Port</th></tr>
        </thead>
        <tbody>
        <tr><td></td>
            <td></td>
            <td></td></tr>
        </tbody>
    </table>    

    <h2>Metadata</h2>
    <table class="table">
        <tbody>
        <tr><td>Json</td>
            <td><pre>{{pool.metadata}}</pre></td></tr>
        <tr><td class="text-nowrap">Hash</td>
            <td>{{ form.metadata_hash }}</td></tr>
        <tr><td>Url</td>
            <td><input v-model="form.metadata_url"  class="form-control"/></td></tr>
        </tbody>
    </table>    

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
            :class="{ active: k.hover }"
          >
            <td colspan="2">
              <div class="d-flex justify-content-between">
                <div class="text-nowrap">
                  <BIconCheckCircleFill
                    class="icon-success"
                    v-if="k.mtime !== 'N/A'"
                  />
                  <BIconExclamationCircleFill
                    class="icon-danger"
                    v-if="k.mtime === 'N/A'"
                  />
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

export default {
    props: ['pool'],
    data () {
        return {
            keygen_list: [],
            registering: false,
            form : JSON.parse(JSON.stringify(this.pool)),
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
        ...mapActions('pools',['loadPool','register','newKey']),
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
    },
    watch : {
        pool: {
            deep: true,
            handler(newdata) {
                //console.log('pool changed:');
                this.form = JSON.parse(JSON.stringify(newdata));
                this.metadata_json = JSON.stringify(newdata.metadata);
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