#!/bin/bash
# Setup cardano node in ubuntu
# SAG, 03/19/2021

DIR=$(dirname $(readlink -f $0))
BIN="$HOME/relay/bin"
DB="$HOME/relay/db"

VERSION=1.26.0
linuxurl=https://hydra.iohk.io/build/5856093/download/1/cardano-node-$VERSION-linux.tar.gz
configurl="https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1"

mkdir -p $BIN
mkdir -p $DB
cd $BIN
wget $linuxurl
tar xvf cardano-node-$VERSION-linux.tar.gz 
rm cardano-node-$VERSION-linux.tar.gz 
echo export PATH=$BIN:$PATH >> ~/.bashrc
echo export CARDANO_NODE_SOCKET_PATH=$HOME/relay/db/node.socket  >> ~/.bashrc
source ~/.bashrc


# url="https://hydra.iohk.io/build/5102327/download/1"
wget $configurl/testnet-config.json
wget $configurl/testnet-shelley-genesis.json
wget $configurl/testnet-byron-genesis.json
wget $configurl/testnet-topology.json
wget $configurl/mainnet-config.json
wget $configurl/mainnet-shelley-genesis.json
wget $configurl/mainnet-byron-genesis.json
wget $configurl/mainnet-topology.json

cardano-node --version

exit 


# build libsodium
export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH"
git clone https://github.com/input-output-hk/libsodium
cd libsodium
git checkout 66f017f1
./autogen.sh
./configure
make
sudo make install
cd $DIR

# download the source code for cardano-node
git clone https://github.com/input-output-hk/cardano-node.git
cd cardano-node
git fetch --all --tags --recurse-submodules
git checkout tags/$VERSION
cabal configure --with-compiler=ghc-$GHC
echo "package cardano-crypto-praos" >>  cabal.project.local
echo "  flags: -external-libsodium-vrf" >>  cabal.project.local
cabal clean
cabal update

# build, this takes hours
cabal build -j cardano-node cardano-cli

cp -p dist-newstyle/build/x86_64-linux/ghc-$GHC/cardano-node-$VERSION/x/cardano-node/build/cardano-node/cardano-node ~/.local/bin/
cp -p dist-newstyle/build/x86_64-linux/ghc-$GHC/cardano-cli-$VERSION/x/cardano-cli/build/cardano-cli/cardano-cli ~/.local/bin/
cardano-cli --version
cd $DIR

# get config files
mkdir relay
cd relay
url="https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1"
# url="https://hydra.iohk.io/build/5102327/download/1"
wget $url/testnet-config.json
wget $url/testnet-shelley-genesis.json
wget $url/testnet-byron-genesis.json
wget $url/testnet-topology.json
cd $DIR
