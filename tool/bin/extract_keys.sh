#!/bin/bash 
# Extract stake pool and payment keys and address from wallet
# https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node
# https://gist.github.com/ilap/3fd57e39520c90f084d25b0ef2b96894
# https://github.com/input-output-hk/$DIR/cardano-addresses

DIR=$(dirname $(readlink -f $0))
TESTNET_MAGIC="--testnet-magic 1097911063"
MAINNET_MAGIC="--mainnet"
MAGIC="$TESTNET_MAGIC"
ROOT=$HOME/cardano
TESTNET=0
MAINNET=1
NETWORK=$TESTNET

# Generated payment and stake keys and addresses
# stake.vkey stake.skey stake.addr payment.vkey payment.skey payment.addr
# Address to fund from wallet: payment.addr

# Generate the master key from mnemonics and derive the stake account keys 
# as extended private and public keys (xpub, xvk)
$DIR/cardano-address key from-recovery-phrase Shelley < $1 > root.prv
cat root.prv |$DIR/cardano-address key child 1852H/1815H/0H/2/0 > stake.xprv
cat root.prv |$DIR/cardano-address key child 1852H/1815H/0H/0/0 > payment.xprv
cat payment.xprv \
	|$DIR/cardano-address key public --with-chain-code \
	|tee payment.xpub \
	|$DIR/cardano-address address payment --network-tag $NETWORK \
	|$DIR/cardano-address address delegation $(cat stake.xprv |$DIR/cardano-address key public --with-chain-code |tee stake.xpub) \
	> base.addr_candidate 

# generate payment and stake verification keys
# $DIR/cardano-address key child 1852H/1815H/0H/0/0 < root.prv \
# 	| $DIR/cardano-address key public --with-chain-code > payment.xvk
# $DIR/cardano-address key child 1852H/1815H/0H/2/0 < root.prv \
# 	| $DIR/cardano-address key public --with-chain-code > stake.xvk

# # generate payment and stake addresses from a payment verification key
# $DIR/cardano-address address payment --network-tag $NETWORK < payment.xvk > payment.addr2
# $DIR/cardano-address address stake --network-tag $NETWORK < stake.xvk > stake.addr2

# # public keys
# cat payment.xprv |$DIR/cardano-address key public --with-chain-code > payment.xpub 
# cat stake.xprv   |$DIR/cardano-address key public --with-chain-code > stake.xpub

# # generate a delegated payment address from a stake key
# $DIR/cardano-address address delegation $(cat stake.xvk) < payment.addr2 > payment-delegated.addr


# cat payment.xpub |$DIR/cardano-address address payment --network-tag $NETWORK \
# 	|$DIR/cardano-address address delegation $(cat stake.xprv |$DIR/cardano-address key public --with-chain-code |tee stake.xpub) > base.addr_candidate 

# xvk/XPub conversion to normal private and public key, keep in mind the 
# keypairs are not a valind Ed25519 signing keypairs.
SESKEY=$( cat stake.xprv | $DIR/bech32 | cut -b -128 )$( cat stake.xpub | $DIR/bech32)
PESKEY=$( cat payment.xprv | $DIR/bech32 | cut -b -128 )$( cat payment.xpub | $DIR/bech32)

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

$DIR/cardano-cli key verification-key \
	--signing-key-file stake.skey \
	--verification-key-file stake.evkey

$DIR/cardano-cli key verification-key \
	--signing-key-file payment.skey \
	--verification-key-file payment.evkey

$DIR/cardano-cli key non-extended-key \
	--extended-verification-key-file payment.evkey \
	--verification-key-file payment.vkey

$DIR/cardano-cli key non-extended-key \
	--extended-verification-key-file stake.evkey \
	--verification-key-file stake.vkey

$DIR/cardano-cli stake-address build \
	--stake-verification-key-file stake.vkey $MAGIC > stake.addr

$DIR/cardano-cli address build \
	--payment-verification-key-file payment.vkey \
	--stake-verification-key-file stake.vkey $MAGIC > payment.addr

#echo "Important the base.addr and the payment.addr_candidate must be the same"
diff -w payment.addr base.addr_candidate && echo OK || echo FAILED


# create registration keys
$DIR/cardano-cli stake-address registration-certificate \
    --stake-verification-key-file stake.vkey \
    --out-file stake.cert

# cleanup
rm root.prv stake.x* payment.x* stake.evkey payment.evkey base.addr_candidate
