#!/bin/bash
# start cardano node as producer or relay

# DIR=$(dirname $(readlink -f $0))
# NETOWORK="--testnet-magic 1097911063"
ROOT=$HOME/cardano
CONF=$ROOT/config
KEYS=$ROOT/keys
PRODUCER_KEYS=""

# load environment variables
. $CONF/env.sh

if [[ "$CARDANO_NODE_ROLE" == "PRODUCER" ]]; then
	PRODUCER_KEYS="--shelley-kes-key $KEYS/kes.skey --shelley-vrf-key $KEYS/vrf.skey --shelley-operational-certificate $KEYS/node.cert"
	echo $PRODUCER_KEYS
fi

cardano-node run \
 	--host-addr 0.0.0.0 \
	--port 3001 \
	--database-path $ROOT/db \
	--socket-path $ROOT/node.socket \
	--topology $CONF/testnet-topology.json \
 	--config $CONF/testnet-config.json $PRODUCER_KEYS



