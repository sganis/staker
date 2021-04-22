#!/bin/bash
# Setup cardano node in ubuntu
# SAG, 03/19/2021

DIR=$(dirname $(readlink -f $0))
CABAL=3.2.0.0
GHC=8.10.2
VERSION=1.25.1

# ubuntu dev tools
sudo apt-get install build-essential pkg-config libffi-dev libgmp-dev -y
sudo apt-get install libssl-dev libtinfo-dev libsystemd-dev zlib1g-dev -y
sudo apt-get install make g++ tmux git jq wget libncursesw5 libtool autoconf -y

# get haskell
wget https://downloads.haskell.org/~cabal/cabal-install-$CABAL/cabal-install-$CABAL-x86_64-unknown-linux.tar.xz
tar -xf cabal-install-$CABAL-x86_64-unknown-linux.tar.xz
mkdir -p ~/.local/bin
mv cabal ~/.local/bin/
echo export PATH="$HOME/.local/bin:$PATH" >> ~/.bashrc
source ~/.bashrc
cabal update
cabal --version

# build GHC
wget https://downloads.haskell.org/~ghc/$GHC/ghc-$GHC-x86_64-deb9-linux.tar.xz
tar -xf ghc-$GHC-x86_64-deb9-linux.tar.xz
cd ghc-$GHC
./configure
sudo make install
ghc --version
cd $DIR

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
url="https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/"
# url="https://hydra.iohk.io/build/5102327/download/1"
wget $url/testnet-config.json
wget $url/testnet-shelley-genesis.json
wget $url/testnet-byron-genesis.json
wget $url/testnet-topology.json
cd $DIR
