#!/bin/bash
# start cardano node as core or relay

DIR=$(dirname $(readlink -f $0))
# NETOWORK="--testnet-magic 1097911063"
ROOT=$HOME/cardano
CONF=$ROOT/config
KEYS=$ROOT/keys
KEYARG=""

# load environment variables
. $CONF/role.sh
. $CONF/network.sh

ROLE=$CARDANO_NODE_ROLE
NETWORK=$CARDANO_NODE_NETWORK
TOPOLOGY=$CONF/node-$NETWORK-topology-$ROLE.json
CONFIG=$CONF/$NETWORK-config.json

if [[ "$CARDANO_NODE_ROLE" == "producer" ]]; then
	if [ ! -e $KEYS/node.cert ]; then
		>&2 echo "Node keys not available"
		exit 1 
	fi
	KEYARG="--shelley-kes-key $KEYS/kes.skey --shelley-vrf-key $KEYS/vrf.skey --shelley-operational-certificate $KEYS/node.cert"
	echo $KEYARG
fi

$DIR/cardano-node run \
 	--host-addr 0.0.0.0 \
	--port 3001 \
	--database-path $ROOT/db \
	--socket-path $ROOT/node.socket \
	--topology $TOPOLOGY \
 	--config $CONFIG $KEYARG



