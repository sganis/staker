#!/bin/sh
URL=https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1
wget -q -O testnet-config.json $URL/testnet-config.json
wget -q -O testnet-byron-genesis.json $URL/testnet-byron-genesis.json
wget -q -O testnet-shelley-genesis.json $URL/testnet-shelley-genesis.json
wget -q -O testnet-alonzo-genesis.json $URL/testnet-alonzo-genesis.json
wget -q -O testnet-topology.json $URL/testnet-topology.json
wget -q -O mainnet-config.json $URL/mainnet-config.json
wget -q -O mainnet-byron-genesis.json $URL/mainnet-byron-genesis.json
wget -q -O mainnet-shelley-genesis.json $URL/mainnet-shelley-genesis.json
wget -q -O mainnet-alonzo-genesis.json $URL/mainnet-alonzo-genesis.json
wget -q -O mainnet-topology.json $URL/mainnet-topology.json

sed -i testnet-config.json -e "s/TraceBlockFetchDecisions\": false/TraceBlockFetchDecisions\": true/g"
sed -i mainnet-config.json -e "s/TraceBlockFetchDecisions\": false/TraceBlockFetchDecisions\": true/g"
