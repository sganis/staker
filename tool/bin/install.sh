#!/bin/bash
# install script

DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano

mkdir -p $ROOT
mkdir -p $ROOT/keys

if [[  "$DIR" != "$ROOT/bin" ]]; then
	mkdir -p $ROOT/bin
	cp -r $DIR/* $ROOT/bin
	mkdir -p $ROOT/config
	cp -r $DIR/../config/* $ROOT/config
fi

$DIR/systemd.sh



