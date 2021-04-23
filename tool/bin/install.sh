#!/bin/bash
# install script

DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano

mkdir -p $ROOT
mkdir -p $ROOT/keys
mkdir -p $ROOT/bin
mkdir -p $ROOT/config

cp -r $DIR/* $ROOT/bin
cp -r $DIR/../config/* $ROOT/config
chmod 755 $ROOT/bin/*

$DIR/systemd.sh



