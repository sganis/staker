#!/bin/bash 
# Register stake pool address and pool
# https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node

DIR=$(dirname $(readlink -f $0))
TESTNET_MAGIC="--testnet-magic 1097911063"
MAINNET_MAGIC="--mainnet"
MAGIC="$TESTNET_MAGIC"
ROOT=$HOME/cardano

# get current slot
slotNo=$(cardano-cli query tip $MAGIC | jq -r '.slotNo')
echo slotNo: ${slotNo}

# find balance and utxo
cardano-cli query utxo --address $(cat payment.addr) $MAGIC --mary-era > fullUtxo.out
tail -n +3 fullUtxo.out | sort -k3 -nr > balance.out
cat balance.out

tx_in=""
total_balance=0
while read -r utxo; do
    in_addr=$(awk '{ print $1 }' <<< "${utxo}")
    idx=$(awk '{ print $2 }' <<< "${utxo}")
    utxo_balance=$(awk '{ print $3 }' <<< "${utxo}")
    total_balance=$((${total_balance}+${utxo_balance}))
    echo TxHash: ${in_addr}#${idx}
    echo ADA: ${utxo_balance}
    tx_in="${tx_in} --tx-in ${in_addr}#${idx}"
done < balance.out
txcnt=$(cat balance.out | wc -l)
echo Total ADA balance: ${total_balance}
echo Number of UTXOs: ${txcnt}

# find keyDeposit
cardano-cli query protocol-parameters $MAGIC --mary-era --out-file params.json
keyDeposit=$(cat params.json | jq -r '.keyDeposit')
echo keyDeposit: $keyDeposit

cardano-cli transaction build-raw ${tx_in} \
    --tx-out $(cat payment.addr)+0 \
    --invalid-hereafter $(( ${slotNo} + 10000)) \
    --fee 0 \
    --out-file tx.tmp \
    --certificate stake.cert

fee=$(cardano-cli transaction calculate-min-fee $MAGIC \
    --tx-body-file tx.tmp \
    --tx-in-count ${txcnt} \
    --tx-out-count 1 \
    --witness-count 2 \
    --byron-witness-count 0 \
    --protocol-params-file params.json | awk '{ print $1 }')
echo fee: $fee

txOut=$((${total_balance}-${keyDeposit}-${fee}))
echo Change Output: ${txOut}

cardano-cli transaction build-raw ${tx_in} \
    --tx-out $(cat payment.addr)+${txOut} \
    --invalid-hereafter $(( ${slotNo} + 10000)) \
    --fee ${fee} \
    --certificate-file stake.cert \
    --out-file tx.raw

cardano-cli transaction sign $MAGIC \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --signing-key-file stake.skey \
    --out-file tx.signed

# submit transaction to register stake address
cardano-cli transaction submit $MAGIC  --tx-file tx.signed

# register pool
cardano-cli stake-pool metadata-hash \
    --pool-metadata-file $ROOT/bin/poolMetaData.json > poolMetaDataHash.txt

# check if your are registerd
cardano-cli query ledger-state $MAGIC | grep publicKey | grep $(cat stakepoolid.txt)
