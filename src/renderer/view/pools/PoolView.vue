<template>
<div>
    <h2>Pool Summary</h2>
    <table class="table">
        <tbody>
        <tr><td>ID</td>
            <td class="text-break">{{ pool.id }}</td></tr>
        <tr><td>Relay nodes</td>
            <td>{{ pool.nodes }}</td></tr>
        <tr><td>Metadata Json</td>
            <td><pre>{{ pool.metadata }}</pre></td></tr>
        <tr><td class="text-nowrap">Metadata Hash</td>
            <td>{{ pool.metadata_hash }}</td></tr>
        <tr><td>Metadata Url</td>
            <td>{{ pool.metadata_url }}</td></tr>
        <tr><td>Rewards account</td>
            <td>{{ pool.rewards_account }}</td></tr>
        <tr><td>Owners</td>
            <td>{{ pool.owners }}</td></tr>
        </tbody>
    </table>
    <button @click="_newKey()" :disabled="getLoading" 
        class="btn btn-primary btn-width"  >Edit</button>
    

    <br/>
    <br/>
    <h2>Registration</h2>
    <table class="table">
        <tbody>
        <tr><td>Status</td>
            <td>{{pool.params && "Registered" || "Not registered"}}</td></tr>
        <div v-if="pool.params">
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
        <tr v-if="pool.params && pool.params.poolParams.retiring">
            <td>Reriting</td>
            <td>{{pool.params && pool.params.poolParams.retiring}}</td></tr>
        <tr><td>Metadata hash</td>
            <td>{{pool.params && pool.params.poolParams.metadata.hash}}</td></tr>
        <tr><td>Metadata url</td>
            <td>{{pool.params && pool.params.poolParams.metadata.url}}</td></tr>
        </div>
        </tbody>
    </table>
    <!-- <pre class="text-break">{{pool.params}}</pre> -->
    <button @click="registering=true" :disabled="getLoading" 
        v-if="!registering"
        class="btn btn-primary btn-width"  >Register</button>
    
    <div v-if="registering">
        <h6>Registration Form</h6>
        <br/>
        <form @submit.prevent="register">
        <div class="row">
            <div class="col">
            <label for="pledge">Pledge:</label></div>
            <div class="col-10">
            <input id="pledge" v-model="fpool.pledge" placeholder="Pledge" 
                class="form-control" required :disabled="getLoading"/></div>
        </div>
        <div class="row">
            <div class="col">
            <label class="top10" for="margin">Margin:</label></div>
            <div class="col-10">
            <input id="margin" v-model="fpool.margin" placeholder="Margin" 
                class="form-control top10" required :disabled="getLoading"/></div>
        </div>        
        <div class="row">
            <div class="col">
            <label class="top10" for="cost">Cost:</label></div>
            <div class="col-10">
            <input id="cost" v-model="fpool.cost" placeholder="Cost" 
                class="form-control top10" required :disabled="getLoading"/></div>
        </div>        
        </form>
        <br/>
        <button @click="register()" :disabled="getLoading" 
            class="btn btn-primary btn-width"  >Submit</button>
            &nbsp;
        <button @click="registering=false" :disabled="getLoading" 
            class="btn btn-secondary btn-width"  >Cancel</button>
    </div>
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
            fpool : {
                pledge: 0,
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
        ...mapActions('pools',['loadPool','registerPool']),
        async _register(pool) {
            let r = await this.register(pool);
            if (r.rc === 0) {
                //this.keygen_list=[];
            }
        }
    },
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