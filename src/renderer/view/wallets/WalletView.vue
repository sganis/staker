<template>
    <div>
        <div class="d-flex justify-content-between subtitle" >
            <div>Balance</div>
            <span>{{ wallet && balance.toFixed(6) }} ADA</span>
        </div>
        <div class="d-flex justify-content-end" >
           <span>{{ wallet && wallet.usd && numberWithCommas((wallet.usd * balance).toFixed(0)) }} USD</span>
        </div>

        <br/>
        <div class="d-flex justify-content-between subtitle" >
          <div>Summary</div>
        </div>
        <table v-if="wallet" class="table">
            <tbody>
            <tr><td>Name:</td><td>{{wallet.name}}</td></tr>
            <tr><td>Wallet ID:</td><td class="text-break">{{wallet.id}}</td></tr>
            <tr><td>Sync status:</td><td>{{syncPercent}}%</td></tr>
            <tr><td>Epoch:</td><td>{{wallet.tip && wallet.tip.epoch_number}}</td></tr>
            <tr><td>Delegation:</td><td>{{wallet.delegation && wallet.delegation.active.status}}</td></tr>
            <tr><td class="text-nowrap">Stake address:</td>
                <td><pre class="text-break">{{wallet.stake_address}}</pre></td></tr>
            </tbody>
        </table>
       
        <br/>
        <div class="d-flex justify-content-between subtitle" >
            <div>Transactions</div>
            <span>
                <button @click="_deposit" 
                    :disabled="getLoading || is_depositing"
                    class="btn btn-sm btn-primary btn-width">Deposit</button>          
                &nbsp;
                <button @click="_withdraw" 
                    :disabled="getLoading || is_withdrawing"
                    class="btn btn-sm btn-primary btn-width">Withdraw</button>
            </span>
        </div>
        <div v-if="is_depositing">
            <br/>
            <div class="form-group">
                <textarea type="text" id="fromaddr" 
                    class="form-control" :value="wallet.addresses && wallet.addresses[0].id"/>
            </div>
            <div class="d-flex justify-content-end top10" >
                <span>{{copyMessage}}</span>&nbsp;
                <button @click="is_depositing=false; copyMessage=''" 
                        :disabled="getLoading"
                        class="btn btn-light btn-sm btn-width">Cancel</button>&nbsp;
                <input class="btn btn-primary btn-sm btn-width"
                    @click="copy" value="Copy" />
                    
            </div>
        </div>
        <div v-if="is_withdrawing">
            <br/>
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
                <div class="d-flex justify-content-end top10 form-group" >
                    <button @click="is_withdrawing=false" 
                        :disabled="getLoading"
                        class="btn btn-light btn-sm btn-width">Cancel</button>&nbsp;
                    <input value="Send" type="submit" 
                        class="btn btn-primary btn-sm btn-width"
                        :disabled="getLoading"/>  
                </div>
            </form>
        </div>
        <br/>
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

        <h2 v-if="wallet" >Change Password</h2>
        <form @submit.prevent="_updatePass">
            <div class="form-group ">
                <input id="currentpass" v-model="currentpass" 
                type="password" placeholder="Current password" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
                <input id="newpass1" v-model="newpass1" 
                type="password" placeholder="New password" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
                <input id="newpass1" v-model="newpass2" 
                type="password" placeholder="New password again" 
                class="form-control" required :disabled="getLoading" />  
            </div>
            <div class="form-group top10">
            <input value="Change" type="submit" 
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
            is_depositing: false,
            is_withdrawing: false,
        }
    },
    computed: {
        ...mapGetters(['getLoading']),        
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
        _deposit() {
            this.is_withdrawing = false;
            if (!this.is_depositing) {
                this.is_depositing = true;
            } else {
                this.is_depositing = false;
            }
        },
        _withdraw() {
            this.is_depositing = false;
            if (!this.is_withdrawing) {                
                this.is_withdrawing = true;
            } else {
                this.is_withdrawing = false;
            }
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