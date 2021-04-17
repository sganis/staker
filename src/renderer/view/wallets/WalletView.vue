<template>
    <div>
        <h2>Summary </h2>
        <div v-if="wallet">
            <div>Name: {{wallet.name}}</div>
            <div>ID: {{wallet.id}}</div>
            <div>Sync: {{syncPercent}}%</div>
            <div>Epoch: {{wallet.tip.epoch_number}}</div>
            <div>Balance: {{wallet.balance.total.quantity}}</div>
            <div>Delegation: {{wallet.delegation.active.status}}</div>
            <!-- <pre>{{wallet.transactions}}</pre> -->
            <br/>
        </div>

        <h2>Balance</h2>
        <div class="d-flex align-items-baseline">
        <span class="h2 ms-auto">{{ wallet && balance.toFixed(6) }}</span>
        &nbsp;
        <span>ADA</span>
        </div>
        <div class="d-flex align-items-baseline">
        <span>&nbsp;</span>
        <span class="h3 ms-auto">{{ wallet && wallet.usd && numberWithCommas(wallet.usd * balance) }}</span>
        &nbsp;
        <span>{{ (wallet && wallet.usd && ' USD') || '&nbsp;' }}</span>
        </div>
        <h2>Recieve</h2>
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
        <h2>Send</h2>
        <div>
        <form>
            <div class="form-group">
                <textarea id="toaddr" v-model="toaddr" 
                    placeholder="Destination address..." 
                    class="form-control" required />
            </div>
            <div class="form-group top10">
                <input value="Send" type="submit" class="btn btn-primary btn-width"
                    :disabled="getLoading"/>  
            </div>
        </form>
        </div>
        <br/>
        <h2>Transactions</h2>
        <table class="table">
            <thead>
                <tr>
                <th scope="col">Time</th>
                <th scope="col">Status</th>
                <th scope="col">ADA</th>
                <!-- <th scope="col">Direction</th> -->
                <th scope="col">Fee</th>
                <th scope="col">Address</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="t in wallet.transactions" :key="t.id">
                <td>{{t.inserted_at.time}}</td>
                <td>{{t.status}}</td>
                <td>{{t.amount.quantity/1000000}}</td>
                <!-- <td>{{t.direction}}</td> -->
                <td>{{t.fee.quantity}}</td>
                <td>{{ formatAddress(t.outputs[1].address)}}</td>
                </tr>
            </tbody>
        </table>
     </div>
</template>
<script>
import {mapGetters,mapActions} from 'vuex'
import {formatAddress, numberWithCommas} from '../../../common/util'

export default {
    props:['wallet'],
    data() {
        return {
            copyMessage: '',
            toaddr: '',
            polling: null,
        }
    },
    computed: {
        ...mapGetters('wallets',['getLoading']),        
        balance() {
            return this.wallet.balance.total.quantity/1000000;
        },
        syncPercent() {
            if (this.wallet.state.status == 'ready')
                return 100;
            return this.wallet.state.progress.quantity;
        }
    },
    methods: {
        ...mapActions('wallets', ['loadWallet']),
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
        },
        formatAddress(a) {
            return formatAddress(a);
        },
        numberWithCommas(a) {
            return numberWithCommas(a);
        }
    },
    beforeUnmount () {
        clearInterval(this.polling);
    },
    mounted () {
        this.loadWallet(this.wallet);
        this.pollData();
    }

}
</script>