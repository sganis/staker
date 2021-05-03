<template>
<div>
    <h2>Pool Summary</h2>
    <form @submit.prevent="register">
    <table class="table">
        <tbody>
        <tr><td>ID</td>
            <td class="text-break">{{ pool.id }}</td></tr>
        <tr><td>Status</td>
            <td>{{(pool.params && pool.params.poolParams) && "Registered" || "Not registered"}}</td></tr>
        <tr><td>Relay nodes</td>
            <td><select multiple class="form-control">
            <option v-for="(r,index) in form.relay_nodes || []" :key="index">
            </option>
            </select>
            </td></tr>
        <tr><td>Metadata Json</td>
            <td><textarea v-model="metadata_json" class="form-control">
                </textarea></td></tr>
        <tr><td class="text-nowrap">Metadata Hash</td>
            <td>{{ form.metadata_hash }}</td></tr>
        <tr><td>Metadata Url</td>
            <td><input v-model="form.metadata_url"  class="form-control"/></td></tr>
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
    
    <button @click="registering=true" :disabled="getLoading" 
        v-if="!registering"
        class="btn btn-primary btn-width"  >Register</button>
    
    <div v-if="registering">
        <h6>Registration Form</h6>
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
        <div class="row">
            <div class="col">
            <label for="pledge">Pledge:</label></div>
            <div class="col-10">
            </div>
        </div>
        <div class="row">
            <div class="col">
            <label class="top10" for="margin">Margin:</label></div>
            <div class="col-10">
            <input id="margin" v-model="form.margin" placeholder="Margin" 
                class="form-control top10" required :disabled="getLoading"/></div>
        </div>        
        <div class="row">
            <div class="col">
            <label class="top10" for="cost">Cost:</label></div>
            <div class="col-10">
            <input id="cost" v-model="form.cost" placeholder="Cost" 
                class="form-control top10" required :disabled="getLoading"/></div>
        </div>        

        <tr><td>Pledge</td>
            <td>{{pool.params && pool.params.poolParams.pledge/1000000}}</td></tr>
        <tr><td>Margin</td>
            <td>{{pool.params && `${pool.params.poolParams.margin*100}%`}}</td></tr>
        <tr><td>Cost</td>
            <td>{{pool.params && `${pool.params.poolParams.cost/1000000} ADA`}}</td></tr>
        <tr><td>Relays</td>
            <td>{{pool.params && pool.params.poolParams.relays}}</td></tr>
        <tr><td class="text-nowrap">Reward Account</td>
            <td>{{pool.params && pool.params.poolParams.rewardAccount}}</td></tr>
        <tr><td>Owners</td>
            <td>{{pool.params && pool.params.poolParams.owners}}</td></tr>
        <tr><td>Metadata hash</td>
            <td>{{pool.params && pool.params.poolParams.metadata.hash}}</td></tr>
        <tr><td>Metadata url</td>
            <td>{{pool.params && pool.params.poolParams.metadata.url}}</td></tr>
        </template>
        </tbody>
    </table>
    </form>

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
            registering: false,
            form : JSON.parse(JSON.stringify(this.pool)),
            metadata_json: JSON.stringify(this.pool.metadata),
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
        ...mapActions('pools',['loadPool','register']),
        async _register() {
            let r = await this.register(this.form);
            // if (r.rc === 0) {
                
            // }
        }
    },
    watch : {
        pool: {
            deep: true,
            handler(newdata) {
                console.log('pool changed:');
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