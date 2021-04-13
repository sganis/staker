#!/bin/bash 
# Extract stake pool keys and address from daedalus
# https://gist.github.com/ilap/3fd57e39520c90f084d25b0ef2b96894
# https://github.com/input-output-hk/cardano-addresses

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
	|tee base.addr_candidate \
	|cardano-address address inspect
echo "Generated from 1852H/1815H/0H/{0,2}/0"
cat base.addr_candidate
echo

# XPrv/XPub conversion to normal private and public key, keep in mind the 
# keypars are not a valind Ed25519 signing keypairs.
TESTNET_MAGIC="--testnet-magic 1097911063"
MAINNET_MAGIC="--mainnet"
MAGIC="$TESTNET_MAGIC"

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
# cardano-cli address build \
# 	--payment-verification-key-file payment.vkey $MAGIC > payment.addr
cardano-cli address build \
	--payment-verification-key-file payment.vkey \
	--stake-verification-key-file stake.vkey $MAGIC > payment.addr

echo "Important the base.addr and the payment.addr_candidate must be the same"
diff -w payment.addr base.addr_candidate && echo ok || echo failed

# stake pool files:
# stake.vkey stake.skey stake.addr payment.vkey payment.skey payment.addr
# address to fund from daedalus: payment.addr
