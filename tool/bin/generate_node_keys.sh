#!/bin/bash 
# Extract stake pool and payment keys and address from wallet
# https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node
# https://gist.github.com/ilap/3fd57e39520c90f084d25b0ef2b96894
# https://github.com/input-output-hk/cardano-addresses

DIR=$(dirname $(readlink -f $0))
TESTNET_MAGIC="--testnet-magic 1097911063"
MAINNET_MAGIC="--mainnet"
MAGIC="$TESTNET_MAGIC"
ROOT=$HOME/cardano

# the block producer node requires 3 keys:
# stake pool cold key (node.cert)
# stake pool hot key (kes.skey)
# stake pool VRF key (vrf.skey)

# Make cold keys and counter
cardano-cli node key-gen \
    --cold-verification-key-file node.vkey \
    --cold-signing-key-file node.skey \
    --operational-certificate-issue-counter node.counter

# generate pool id
cardano-cli stake-pool id \
	--cold-verification-key-file node.vkey \
	--output-format hex > pool.id


# create kes keys
# KES (key evolving signature) keys are created to secure your stake pool
# against hackers who might compromise your keys. 
# On mainnet, you will need to regenerate the KES key every 90 days.
cardano-cli node key-gen-KES \
    --verification-key-file kes.vkey \
    --signing-key-file kes.skey

# create vrf keys
cardano-cli node key-gen-VRF \
    --verification-key-file vrf.vkey \
    --signing-key-file vrf.skey

slotsPerKESPeriod=$(cat ${ROOT}/config/testnet-shelley-genesis.json | jq -r '.slotsPerKESPeriod')
echo slotsPerKESPeriod: ${slotsPerKESPeriod}
slotNo=$(cardano-cli query tip $MAGIC | jq -r '.slotNo')
echo slotNo: ${slotNo}
kesPeriod=$((${slotNo} / ${slotsPerKESPeriod}))
echo kesPeriod: ${kesPeriod}

# create operational certificate
cardano-cli node issue-op-cert \
    --kes-verification-key-file kes.vkey \
    --cold-signing-key-file node.skey \
    --operational-certificate-issue-counter node.counter \
    --kes-period ${kesPeriod} \
    --out-file node.cert