<template>
    <div>
        <!-- <pre>{{wallet}}</pre> -->
        <h2>Summary </h2>
        <div v-if="wallet">
            <div>Name: {{wallet.name}}</div>
            <div>ID: {{wallet.id}}</div>
            <div>Sync: {{syncPercent}}%</div>
            <div>Epoch: {{wallet.tip && wallet.tip.epoch_number}}</div>
            <!-- <div>Balance: {{wallet.balance.total.quantity}}</div> -->
            <div>Delegation: {{wallet.delegation && wallet.delegation.active.status}}</div>
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
        <span class="h3 ms-auto">{{ wallet && wallet.usd && numberWithCommas((wallet.usd * balance).toFixed(0)) }}</span>
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
        <form @submit.prevent="_transaction">
            <div class="form-group">
                <textarea id="toaddr" v-model="toaddr" 
                    placeholder="Destination address..." 
                    class="form-control" required />
            </div>
            <div class="form-group top10">
                <input id="amount" v-model="amount" 
                type="text" placeholder="Amount" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
                <input id="txpass" v-model="txpass" 
                type="password" placeholder="Passphrase" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
                <input value="Send" type="submit" class="btn btn-primary btn-width"
                    :disabled="getLoading"/>  
            </div>
        </form>
        </div>
        <br/>
        <h2>Transactions</h2>
        <!-- <pre>{{wallet.transactions.filter(x=>x.status=='pending')}}</pre> -->
        
        <table class="table">
            <thead>
                <tr>
                <th scope="col">Time</th>
                <th scope="col">Status</th>
                <th scope="col">ADA</th>
                <th scope="col">Direction</th>
                <th scope="col">Fee</th>
                <th scope="col">Address</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="t in wallet.transactions || []" :key="t.id">
                <td>{{t.inserted_at && t.inserted_at.time.split('T')[0]}}</td>
                <td>{{t.status}}</td>
                <td>{{t.amount.quantity/1000000}}</td>
                <td>{{t.direction}}</td>
                <td>{{t.fee.quantity}}</td>
                <td>{{ formatAddress(t.outputs[0].address)}}</td>
                </tr>
            </tbody>
        </table>

        <h2 v-if="wallet" >Rename</h2>
        <form @submit.prevent="_rename">
            <div class="form-group ">
            <input id="newname" v-model="newname" placeholder="New name" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
            <input value="Rename" type="submit" class="btn btn-primary btn-width"
                :disabled="getLoading"/>  
            </div>        
        </form>

        <h2 v-if="wallet" >Update passphrase</h2>
        <form @submit.prevent="_updatePass">
            <div class="form-group ">
                <input id="currentpass" v-model="currentpass" 
                type="password" placeholder="Current passphrase" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
                <input id="newpass1" v-model="newpass1" 
                type="password" placeholder="New passphrase" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
                <input id="newpass1" v-model="newpass2" 
                type="password" placeholder="New passphrase again" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
            <input value="Update phassprase" type="submit" 
                class="btn btn-primary btn-width" :disabled="getLoading"/>  
            </div>        
        </form>

        <h2 v-if="wallet" >Delete</h2>
        <form @submit.prevent="_delete">
            <div class="form-group top10">
                <input value="Delete Wallet" type="submit" 
                    class="btn btn-danger btn-width"
                    :disabled="getLoading"/>  
            </div>        
        </form>

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
            polling: null,
            newname: '',
            currentpass: '',
            newpass1: '',
            newpass2: '',
            toaddr: 'addr_test1qzg5kt9snzjnyvl84tudz8nq7z8ekky9sdshg3eepkzklu5ygffk9q03s8sv5grpcna9rxzdryhknwjjt2qgzhcl0c9sf8888z',
            txpass: '', // 'Password123',
            amount: 1,
        }
    },
    computed: {
        ...mapGetters('wallets',['getLoading']),        
        balance() {
            return this.wallet.balance 
                ? this.wallet.balance.total.quantity/1000000
                : 0;
        },
        syncPercent() {
            if (this.wallet.state && this.wallet.state.status == 'ready')
                return 100;
            return this.wallet.state ? this.wallet.state.progress.quantity: 0;
        }
    },
    methods: {
        ...mapActions('wallets', ['load','deselectAll','rename',
                                    'updatePass','delete','transaction']),
        copy() {
            var copyText = document.getElementById("fromaddr");
            copyText.select();
            copyText.setSelectionRange(0, 99999); /* For mobile devices */
            document.execCommand("copy");
            this.copyMessage = 'copied!'        
        },
        pollData() {
            this.polling = setInterval(() => {
                this.load(this.wallet);                
            }, 5000);
        },
        formatAddress(a) {
            return formatAddress(a);
        },
        numberWithCommas(a) {
            return numberWithCommas(a);
        },
        _transaction() {
            let w = {
                id: this.wallet.id, 
                toaddr: this.toaddr, 
                amount: this.amount,
                txpass: this.txpass,
            }
            this.transaction(w);
        },
        _rename() {
            let w = {id: this.wallet.id, newname: this.newname}
            this.rename(w);
        },
        _updatePass() {
            let w = {
                id: this.wallet.id,
                currentpass: this.currentpass,
                newpass1: this.newpass1,
                newpass2: this.newpass2
            }
            this.updatePass(w);
        },
        _delete() {
            this.deselectAll();
            this.delete(this.wallet);
        }
    },
    beforeUnmount () {
        clearInterval(this.polling);
    },
    mounted () {
        this.load(this.wallet);
        this.pollData();
    }

}
</script>