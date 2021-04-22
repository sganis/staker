#!/bin/bash
# start cardano node

DIR=$(dirname $(readlink -f $0))

export CARDANO_NODE_SOCKET_PATH=/home/san/ada/relay/db/node.socket
export PATH=/home/san/.local/bin:$PATH

cd $DIR

cardano-node run \
 --topology testnet-topology.json \
 --database-path db \
 --socket-path db/node.socket \
 --host-addr 0.0.0.0 \
 --port 3001 \
 --config testnet-config.json

exit



# from different terminal, query activity
export CARDANO_NODE_SOCKET_PATH=$DIR/relay/db/node.socket
cardano-cli query tip --testnet-magic 1097911063

## generate payment key pair
cardano-cli address key-gen \
	--verification-key-file payment.vkey \
	--signing-key-file payment.skey

## generate a stake key pair
cardano-cli stake-address key-gen \
	--verification-key-file stake.vkey \
	--signing-key-file stake.skey

## generate payment address
cardano-cli address build \
	--payment-verification-key-file payment2.vkey \
	--stake-verification-key-file stake.vkey \
	--out-file payment2.addr \
	--testnet-magic 1097911063

## grenerate a stake address
cardano-cli stake-address build \
	--stake-verification-key-file stake.vkey \
	--out-file stake.addr --testnet-magic 1097911063

# request funds
curl -v -XPOST "https://faucet.ff.dev.cardano.org/send-money/$(cat payment.addr)"

## check balance
cardano-cli query utxo \
	--mary-era --address $(cat payment.addr) --testnet-magic 1097911063

## create a transaction
SRC_BALANCE=20000000
DST_AMOUNT=10000000

# get protocol parameters
cardano-cli query protocol-parameters --mary-era \
--out-file protocol.json --testnet-magic 1097911063 

# get hash and index for --tx-in <TxHash>#<TxTx>
cardano-cli query utxo --address $(cat payment.addr) --testnet-magic 1097911063

# draft tx
cardano-cli transaction build-raw \
--tx-in 4e3a6e7fdcb0d0efa17bf79c13aed2b4cb9baf37fb1aa2e39553d5bd720c5c99#4 \
--tx-out $(cat payment2.addr)+0 \
--tx-out $(cat payment.addr)+0 \
--invalid-hereafter 0 \
--fee 0 \
--out-file tx.draft

# calculate fee
FEE=$(cardano-cli transaction calculate-min-fee \
	--tx-body-file tx.draft \
	--tx-in-count 1 \
	--tx-out-count 2 \
	--witness-count 1 \
	--byron-witness-count 0 \
	--testnet-magic 1097911063 \
	--protocol-params-file protocol.json)
# calculate change
CHANGE=$(expr $SRC_BALANCE - $DST_AMOUNT - $FEE)

# set TTL, get slotNo from this
cardano-cli query tip --testnet-magic 1097911063
#TTL=slotNo+200

# build tx
cardano-cli transaction build-raw \
	--tx-in 4e3a6e7fdcb0d0efa17bf79c13aed2b4cb9baf37fb1aa2e39553d5bd720c5c99#4 \
	--tx-out $(cat payment2.addr)+$DST_AMOUNT \
	--tx-out $(cat payment.addr)+$CHANGE \
	--invalid-hereafter $TTL \
	--fee $FEE \
	--out-file tx.raw

# sign tx
cardano-cli transaction sign \
	--tx-body-file tx.raw \
	--signing-key-file payment.skey \
	--testnet-magic 1097911063 \
	--out-file tx.signed

# submit tx
cardano-cli transaction submit \
	--tx-file tx.signed \
	--testnet-magic 1097911063

# check balances
cardano-cli query utxo \
    --address $(cat payment.addr) \
    --testnet-magic 1097911063
cardano-cli query utxo \
    --address $(cat payment2.addr) \
    --testnet-magic 1097911063

## Register stake address
# create registration certificate
cardano-cli stake-address registration-certificate \
	--stake-verification-key-file stake.vkey \
	--out-file stake.cert

# build tx draft
cardano-cli transaction build-raw \
--tx-in b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee#1 \
--tx-out $(cat payment.addr)+0 \
--invalid-hereafter 0 \
--fee 0 \
--out-file tx.draft \
--certificate-file stake.cert

cardano-cli transaction calculate-min-fee \
--tx-body-file tx.draft \
--tx-in-count 1 \
--tx-out-count 1 \
--witness-count 2 \
--byron-witness-count 0 \
--protocol-params-file protocol.json \
--testnet-magic 1097911063


