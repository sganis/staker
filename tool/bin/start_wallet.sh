#!/bin/bash
# start cardano wallet

DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano
. $CONF/network.sh

if [[ "$CARDANO_NODE_NETWORK" == "testnet" ]];then
	NETWORK="--testnet $ROOT/config/testnet-byron-genesis.json"
elif [[ "$CARDANO_NODE_NETWORK" == "mainnet" ]]; then
	NETWORK="--mainnet"
else
	>&2 echo "Invalid network: $CARDANO_NODE_NETWORK"
	exit 1
fi

$DIR/cardano-wallet serve $NETWORK \
  	--node-socket $ROOT/node.socket \
  	--database $ROOT/wallets \
  	--log-level NOTICE



