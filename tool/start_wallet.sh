#!/bin/bash
# start cardano node

DIR=$(dirname $(readlink -f $0))
NETOWORK="--testnet-magic 1097911063"
ROOT=$HOME/cardano

# cd $ROOT/relay
# it must start in the node folder (relay or producer)
cardano-wallet serve \
	--testnet testnet-byron-genesis.json \
  	--node-socket $ROOT/node.socket \
  	--database ./wallets \
  	--log-level NOTICE



