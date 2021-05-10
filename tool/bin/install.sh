#!/bin/bash
# install script
# run as sudo from cardano/upgrade/bin

USER=$SUDO_USER
HOME=$(eval echo ~$USER)
DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano

mkdir -p $ROOT
mkdir -p $ROOT/keys

# stop service
systemctl stop cardano-node 2>/dev/null
systemctl stop cardano-wallet 2>/dev/null

mkdir -p $ROOT/bin
cp -r $DIR/* $ROOT/bin
mkdir -p $ROOT/config

cp $DIR/../config/testnet-* $ROOT/config
cp $DIR/../config/mainnet-* $ROOT/config

# do not overwrite config files
[ ! -f $ROOT/config/role.sh ] && cp $DIR/../config/role.sh $ROOT/config
[ ! -f $ROOT/config/network.sh ] && cp $DIR/../config/network.sh $ROOT/config
[ ! -f $ROOT/config/node-testnet-topology-relay.json ] && cp $DIR/../config/testnet-topology.json $ROOT/config/node-testnet-topology-relay.json
[ ! -f $ROOT/config/node-testnet-topology-producer.json ] && cp $DIR/../config/testnet-topology.json $ROOT/config/node-testnet-topology-producer.json
[ ! -f $ROOT/config/node-mainnet-topology-relay.json ] && cp $DIR/../config/mainnet-topology.json $ROOT/config/node-mainnet-topology-relay.json
[ ! -f $ROOT/config/node-mainnet-topology-producer.json ] && cp $DIR/../config/mainnet-topology.json $ROOT/config/node-mainnet-topology-producer.json

echo "fixing permissions..."
chmod 750 $ROOT/bin/*
chmod 660 $ROOT/config/*
chmod 600 $ROOT/keys/*
chown -R $USER $ROOT
# dos2unix $ROOT/bin/*.py $ROOT/bin/*.sh $ROOT/config/*.sh $ROOT/config/*.json

# so $HOME is expanded to current user home
echo "installing systemd services..."

/bin/bash -c "cat << 'EOF' > /etc/systemd/system/cardano-node.service
[Unit]
Description=Cardano Node
After=network.target

[Service]
Type=simple
Restart=on-failure
RestartSec=5
User=$USER
LimitNOFILE=1048576
WorkingDirectory=$HOME/cardano
ExecStart=/bin/bash -l -c \"exec $HOME/cardano/bin/start_node.sh\"
ExecStop=/bin/bash -l -c \"exec kill -2 \$(ps -ef | grep [c]ardano-node | tr -s ' ' | cut -d ' ' -f2)\"
KillSignal=SIGINT
SuccessExitStatus=143
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=cardano-node
TimeoutStopSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target
EOF"

systemctl daemon-reload
systemctl enable cardano-node.service

/bin/bash -c "cat << 'EOF' > /etc/systemd/system/cardano-wallet.service
[Unit]
Description=Cardano Wallet
After=cardano-node.service
Requires=cardano-node.service
PartOf=cardano-node.service

[Service]
Type=simple
Restart=on-failure
RestartSec=5
User=$USER
LimitNOFILE=1048576
WorkingDirectory=$HOME/cardano
ExecStart=/bin/bash -l -c \"exec $HOME/cardano/bin/start_wallet.sh\"
ExecStop=/bin/bash -l -c \"exec kill -2 \$(ps -ef | grep [c]ardano-wallet | tr -s ' ' | cut -d ' ' -f2)\"
KillSignal=SIGINT
SuccessExitStatus=143
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=cardano-wallet
TimeoutStopSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target cardano-node.service
EOF"

systemctl daemon-reload
systemctl enable cardano-wallet.service

# add no sudo passoword to restart services
grep -qF 'NOPASSWD: /bin/systemctl' /etc/sudoers 
if [ $? -ne 0 ];then
	chmod 640 /etc/sudoers
	echo "$USER ALL = NOPASSWD: /bin/systemctl" >> /etc/sudoers
	chmod 440 /etc/sudoers
fi

# add cardano/bin folder to PATH
# grep -qF '/cardano/bin' $HOME/.bashrc
# if [ $? -ne 0 ];then
# 	echo "export PATH=$HOME/cardano/bin:$PATH" >> $HOME/.bashrc
# fi

systemctl start cardano-node


