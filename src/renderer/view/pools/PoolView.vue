<template>
<div>
    <h2>Pool Summary</h2>
    <table class="table">
        <tbody>
        <tr><td>ID: </td>
            <td class="text-break">{{ pool.id }}</td>
        </tr>
        <tr><td>Relay nodes: </td>
            <td class="col-11">{{ pool.nodes }}</td>
        </tr>
        </tbody>
    </table>

    <h2>Metadata</h2>
    <b>Json:</b>
    <pre>{{pool.metadata}}</pre>
    <b>Hash:</b>
    <pre class="text-break">{{pool.metadata_hash}}</pre>
    <b>Url:</b>
    <pre class="text-break">{{pool.metadata_url}}</pre>
    <button @click="_newKey()" :disabled="getLoading" 
        class="btn btn-primary btn-width"  >Edit</button>
    
    <br/>
    <br/>
    <h2>Registration</h2>
    <pre class="text-break">{{pool.params}}</pre>

</div>
</template>

<script>

import {mapGetters, mapActions} from 'vuex';

export default {
    props: ['pool'],
    data () {
        return {
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