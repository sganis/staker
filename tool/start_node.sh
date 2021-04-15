#!/bin/bash
# start cardano node

DIR=$(dirname $(readlink -f $0))
NETOWORK="--testnet-magic 1097911063"
ROOT=$HOME/cardano

# cd $ROOT/relay
# it must start in the node folder (relay or producer)
cardano-node run \
 	--topology testnet-topology.json \
 	--database-path db \
	--socket-path $ROOT/node.socket \
	--host-addr 0.0.0.0 \
	--port 3001 \
	--config testnet-config.json



