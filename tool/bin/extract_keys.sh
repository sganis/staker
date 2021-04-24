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
	--output-format hex > stakepoolid.txt


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

# Generated payment and stake keys and addresses
# stake.vkey stake.skey stake.addr payment.vkey payment.skey payment.addr
# Address to fund from wallet: payment.addr

# Generate the master key from mnemonics and derive the stake account keys 
# as extended private and public keys (xpub, xprv)
cardano-address key from-recovery-phrase Shelley < $1 > root.prv
cat root.prv |cardano-address key child 1852H/1815H/0H/2/0 > stake.xprv
cat root.prv |cardano-address key child 1852H/1815H/0H/0/0 > payment.xprv

TESTNET=0
MAINNET=1
NETWORK=$TESTNET

cat payment.xprv |cardano-address key public --with-chain-code \
	|tee payment.xpub |cardano-address address payment --network-tag $NETWORK \
	|cardano-address address delegation $(cat stake.xprv | cardano-address key public --with-chain-code | tee stake.xpub) \
	|tee base.addr_candidate 
# |cardano-address address inspect
# echo "Generated from 1852H/1815H/0H/{0,2}/0"
# cat base.addr_candidate
# echo

# XPrv/XPub conversion to normal private and public key, keep in mind the 
# keypars are not a valind Ed25519 signing keypairs.
SESKEY=$( cat stake.xprv | bech32 | cut -b -128 )$( cat stake.xpub | bech32)
PESKEY=$( cat payment.xprv | bech32 | cut -b -128 )$( cat payment.xpub | bech32)

cat << EOF > stake.skey
{
    "type": "StakeExtendedSigningKeyShelley_ed25519_bip32",
    "description": "",
    "cborHex": "5880$SESKEY"
}
EOF

cat << EOF > payment.skey
{
    "type": "PaymentExtendedSigningKeyShelley_ed25519_bip32",
    "description": "Payment Signing Key",
    "cborHex": "5880$PESKEY"
}
EOF

cardano-cli key verification-key \
	--signing-key-file stake.skey --verification-key-file stake.evkey
cardano-cli key verification-key \
	--signing-key-file payment.skey --verification-key-file payment.evkey

cardano-cli key non-extended-key \
	--extended-verification-key-file payment.evkey \
	--verification-key-file payment.vkey

cardano-cli key non-extended-key \
	--extended-verification-key-file stake.evkey \
	--verification-key-file stake.vkey


cardano-cli stake-address build \
	--stake-verification-key-file stake.vkey $MAGIC > stake.addr

cardano-cli address build \
	--payment-verification-key-file payment.vkey \
	--stake-verification-key-file stake.vkey $MAGIC > payment.addr

#echo "Important the base.addr and the payment.addr_candidate must be the same"
diff -w payment.addr base.addr_candidate && echo OK || echo FAILED


# create registration keys
cardano-cli stake-address registration-certificate \
    --stake-verification-key-file stake.vkey \
    --out-file stake.cert

