#!/bin/bash
# install script

if [ $# -lt 2 ];then
	echo "usage: ./$0 <user> <homedir>"
	exit 1
fi

USER=$1
HOME=$2
DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano

mkdir -p $ROOT
mkdir -p $ROOT/keys

if [[ "$DIR" != "$ROOT/bin" ]]; then
	mkdir -p $ROOT/bin
	cp -r $DIR/* $ROOT/bin
	mkdir -p $ROOT/config
	cp -r $DIR/../config/* $ROOT/config
fi
chmod 755 $ROOT/bin/*


# so $HOME is expanded to current user home
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
grep -qF '/bin/systemctl' /etc/sudoers 
if [ $? -ne 0 ];then
	chmod 640 /etc/sudoers
	bash -c "echo \"$USER ALL = NOPASSWD: /bin/systemctl\" >> /etc/sudoers"
	chmod 440 /etc/sudoers
fi


