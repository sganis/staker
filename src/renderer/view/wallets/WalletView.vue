<template>
    <div>
        <div v-if="wallet">
            <div>Name: {{wallet.name}}</div>
            <div>ID: {{wallet.id}}</div>
            <div>Sync: {{syncPercent}}%</div>
            <div>Epoch: {{wallet.tip.epoch_number}}</div>
            <div>Balance: {{wallet.balance.total.quantity}}</div>
            <div>Delegation: {{wallet.delegation.active.status}}</div>
            <!-- <pre>{{wallet}}</pre> -->
            <br/>
        </div>

        <div class="d-flex align-items-baseline">
            
        <span class="h1">Balance</span>
        <span class="h1 ms-auto">{{ wallet && (wallet.balance.total.quantity/1000000).toFixed(6) }}</span>
        &nbsp;
        <span>ADA</span>
        </div>
        <div class="d-flex align-items-baseline">
        <span>&nbsp;</span>
        <!-- <span class="h3 ms-auto">{{ wallet && wallet.balance_usd }}</span> -->
        <!-- <span class="h4 ms-auto">1.45</span> -->
        &nbsp;
        <!-- <span>USD</span> -->
        </div>
        <h1>Recieve</h1>
         <div class="form-group">
             <textarea type="text" id="fromaddr" 
                class="form-control" :value="wallet.addresses && wallet.addresses[0].id"/>
            <br/>
        </div>
        <input class="btn btn-primary btn-width"
            @click="copy" value="Copy" />
            &nbsp;&nbsp;<span>{{copyMessage}}</span>
        <br/>
        <br/>        
        <h1>Send</h1>
        <div>
        <form>
            <div class="form-group">
                <textarea id="toaddr" v-model="toaddr" 
                    placeholder="Destination address..." 
                    class="form-control" required />
            </div>
            <div class="form-group top10">
                <input value="Send" type="submit" class="btn btn-primary btn-width"
                    :disabled="loading"/>  
            </div>
        </form>
        </div>
        <br/>
        <h1>Transactions</h1>
    </div>
</template>
<script>
import {mapActions} from 'vuex'

export default {
    props:['wallet'],
    data() {
        return {
            copyMessage: '',
            toaddr: '',
            loading: false,
            polling: null,
        }
    },
    // watch: {
    //     wallet(w) {
    //         this.getBalance(w.name);
    //     }
    // },
    computed: {
        syncPercent() {
            if (this.wallet.state.status == 'ready')
                return 100;
            return this.wallet.state.progress.quantity;
        }
    },
    methods: {
        ...mapActions('wallets', ['loadWallet','loadAddresses']),
        copy() {
            var copyText = document.getElementById("fromaddr");
            copyText.select();
            copyText.setSelectionRange(0, 99999); /* For mobile devices */
            document.execCommand("copy");
            this.copyMessage = 'copied!'        
        },
        pollData() {
            this.polling = setInterval(() => {
                this.loadWallet(this.wallet);                
            }, 5000);
        }
    },
    beforeUnmount () {
        clearInterval(this.polling);
    },
    mounted () {
        this.loadWallet(this.wallet);
        this.loadAddresses(this.wallet);
        this.pollData();
    }

}
</script>