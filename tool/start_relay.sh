#!/bin/bash
# start cardano node

DIR=$(dirname $(readlink -f $0))
NETOWORK="--testnet-magic 1097911063"

cardano-node run \
 --topology testnet-topology.json \
 --database-path db \
 --socket-path db/node.socket \
 --host-addr 0.0.0.0 \
 --port 3001 \
 --config testnet-config.json

