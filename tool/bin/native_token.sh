#!/bin/sh
# create native token

HOME=$(eval echo ~$USER)
DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano
WALLET=/home/san/cardano/wallets/377b5fb2b90a5f937b1a72b309787fb1e26e28ba
PAY_ADDR_FILE=$WALLET/payment.addr
PAY_SEKY_FILE=$WALLET/payment.skey
PAY_VKEY_FILE=$WALLET/payment.vkey
PAY_ADDR=$(cat $PAY_ADDR_FILE)
NETWORK="--testnet-magic 1097911063"
POLICY_DIR=$ROOT/policy
POLICY_SCRIPT=$ROOT/policy/policy.script

mkdir -p $POLICY_DIR

# get protocol parameters
cardano-cli query protocol-parameters $NETWORK --out-file $POLICY_DIR/protocol.json

# query address balance to get TxHash and TxIx
TX_IN=$(cardano-cli query utxo $NETWORK --address $PAY_ADDR| tail -1 |awk '{print $1"#"$2}')
BALANCE=$(cardano-cli query utxo $NETWORK --address $PAY_ADDR| tail -1 |awk '{print $3}')
echo TX_IN: $TX_IN
echo Balance: $BALANCE

# create policy script
echo "{" > $POLICY_SCRIPT 
echo "  \"keyHash\": \"$(cardano-cli address key-hash --payment-verification-key-file $PAY_VKEY_FILE)\"," >> $POLICY_SCRIPT 
echo "  \"type\": \"sig\"" >> $POLICY_SCRIPT 
echo "}" >> $POLICY_SCRIPT 
echo Policy script:
cat $POLICY_SCRIPT 

# get policy id
POLICY_ID="$(cardano-cli transaction policyid --script-file $POLICY_SCRIPT)"
echo Policy ID: $POLICY_ID

# build raw transaction
cardano-cli transaction build-raw \
	--mary-era \
	--fee 0 \
	--tx-in $TX_IN \
	--tx-out $PAY_ADDR+$BALANCE+"1000 $POLICY_ID.Peso" \
	--mint="1000 $POLICY_ID.Peso" \
	--minting-script-file $POLICY_SCRIPT \
	--out-file $POLICY_DIR/matx.raw

# calculate fee
FEE=$(cardano-cli transaction calculate-min-fee $NETWORK \
	--tx-body-file $POLICY_DIR/matx.raw \
	--tx-in-count 1 \
	--tx-out-count 1 \
	--witness-count 2 \
	--protocol-params-file $POLICY_DIR/protocol.json|awk '{print $1}')
echo Fee: $FEE
CHANGE=$((BALANCE-FEE))
echo Change: $CHANGE

cardano-cli transaction build-raw \
	--mary-era \
	--fee $FEE \
	--tx-in $TX_IN \
	--tx-out $PAY_ADDR+$CHANGE+"1000 $POLICY_ID.Peso" \
	--mint="1000 $POLICY_ID.Peso" \
	--minting-script-file $POLICY_SCRIPT \
	--out-file $POLICY_DIR/matx.raw

cardano-cli transaction sign $NETWORK \
	--signing-key-file $PAY_SEKY_FILE \
	--signing-key-file $PAY_SEKY_FILE \
	--tx-body-file $POLICY_DIR/matx.raw \
	--out-file $POLICY_DIR/matx.signed

cardano-cli transaction submit --tx-file  $POLICY_DIR/matx.signed $NETWORK

