<template>
    <div>
        <h1>Balance: {{ wallet && wallet.balance }}</h1>
        <br/>
        <h1>Recieve</h1>
        <p class="text-break">{{wallet && wallet.address}}</p>
        <br/>
        <h1>Send</h1>
        <div>
        <form>
            <div class="form-group">
                <input id="toaddr" v-model="toaddr" 
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
    mounted() {
        this.getBalance();
    },
    computed: {

    },
    methods: {
        ...mapActions(['getBalance']),
        
    }

}
</script>