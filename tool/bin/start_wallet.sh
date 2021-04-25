#!/bin/bash
# start cardano wallet

# DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano

cardano-wallet serve \
	--testnet $ROOT/config/testnet-byron-genesis.json \
  	--node-socket $ROOT/node.socket \
  	--database $ROOT/wallets \
  	--log-level NOTICE



