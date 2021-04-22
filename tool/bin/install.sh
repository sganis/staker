#!/bin/bash
# install script

DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano

mkdir -p $ROOT
mkdir -p $ROOT/keys

cp -r $DIR/bin $ROOT
cp -r $DIR/config $ROOT


