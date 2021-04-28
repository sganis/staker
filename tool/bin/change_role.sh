#!/bin/bash 

DIR=$(dirname $(readlink -f $0))
CONF=$DIR/../config

if [[ $# -lt 1 ]]; then
	echo "usage: ./$0 <relay|producer>"
	exit 1
fi
role=$1
new_role=""

if [[ "$role"  == "relay" ]]; then
	echo export CARDANO_NODE_ROLE=producer > $CONF/role.sh
	echo changed to $new_role

elif [[ "$role"  == "producer" ]]; then
	echo export CARDANO_NODE_ROLE=relay > $CONF/role.sh
	echo changed to $new_role
else
	echo unknown role: $new_role
	exit -1
fi

