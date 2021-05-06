#!/bin/bash 

DIR=$(dirname $(readlink -f $0))
CONF=$DIR/../config


. $CONF/role.sh

if [ "$CARDANO_NODE_ROLE" = "relay" ]; then
	echo export CARDANO_NODE_ROLE=producer > $CONF/role.sh
else
	echo export CARDANO_NODE_ROLE=relay > $CONF/role.sh
fi

. $CONF/role.sh
echo changed to $CARDANO_NODE_ROLE

