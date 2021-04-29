<template>
<div>
    <h2>Pool Summary</h2>

    <table class="table">
        <tbody>
        <tr>
            <td>ID: </td>
            <td class="col-6">{{ pool.id }}</td>
            <td class="col-4 text-nowrap">
     
            </td>
        </tr>
        <tr><td>Relay nodes: </td>
            <td class="col-11">{{ pool.nodes }}</td>
            <td class="col-4 text-nowrap">
            
            </td></tr>
        </tbody>
    </table>

    <br/>
    <h2>Registration</h2>


</div>
</template>

<script>

import {mapGetters, mapActions} from 'vuex';

export default {
    props: ['pool'],
    data () {
        return {
            sudo: '',
            need_sudo: false,
            keygen_list: [],
       }
    },
    computed: {
        ...mapGetters('pools',['getPoolStatus','getLoading']),
        status() {
            return !this.pool || !this.pool.status || !this.pool.status.pool_status ? {
                poolRole: 'N/A',
                poolService: 'N/A',
                walletService: 'N/A',
                poolSync: 'N/A',
                timeSync: 'N/A',
                disk: 0,
                memory: 0,
                cpu: 0,
            } : {
                poolRole: this.pool.status.pool_role.toUpperCase(),
                poolService: this.pool.status.pool_status === 1 ? 'Running' 
                             : this.pool.status.pool_status === 2 ? 'Stopped'
                             : 'Not installed',
                walletService: this.pool.status.wallet_status === 1 ? 'Running'
                             : this.pool.status.wallet_status === 2 ? 'Stopped'
                             : 'Not installed',
                poolSync: this.pool.status.pool_sync ? this.pool.status.pool_sync +'%' : 'N/A',  
                timeSync: this.pool.status.time_sync === 1 ? 'Ok'
                            : this.pool.status.time_sync === 2 ? `Out of sync: Network: ${this.pool.status.network_time} Pool: ${this.pool.status.pool_time}`
                            : 'N/A',
                disk: Math.round(this.pool.status.disk[0]/this.pool.status.disk[1] * 100),
                memory: Math.round(this.pool.status.memory[0]/this.pool.status.memory[1] * 100),
                cpu: Math.round(this.pool.status.cpu * 100),
            
            }
        },
    },
    mounted() {
        //this.loadPoolKeys(this.pool);
    },
    methods: {
        ...mapActions('pools',['updatePoolStatus',
            'disconnectPool','deselectAllPools','removePool',
            'installPool','hasTools','serviceAction','changeRole',
            'loadPoolKeys','newKey',
        ]),
    
        remove(pool) {
            this.deselectAllPools();
            this.removePool(pool);
        },
        async _installPool() {
            if (!this.sudo)
                this.need_sudo = true;
            else {
                let r = await this.installPool({pool: this.pool, sudo: this.sudo});
                if (r.rc === 0)
                    this.need_sudo = false;
            }
        },
        async _newKey(args) {
            let r = await this.newKey(args);
            if (r.rc === 0) {
                this.keygen_list=[];
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