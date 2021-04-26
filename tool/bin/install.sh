#!/bin/bash
# install script
# run as sudo

USER=$SUDO_USER
HOME=$(eval echo ~$USER)
DIR=$(dirname $(readlink -f $0))
ROOT=$HOME/cardano

mkdir -p $ROOT
mkdir -p $ROOT/keys

if [ "$DIR" != "$ROOT/bin" ]; then
	echo "deploying..."
	mkdir -p $ROOT/bin
	cp -rv $DIR/* $ROOT/bin
	mkdir -p $ROOT/config
	cp -rv $DIR/../config/* $ROOT/config
fi

echo "fixing permissions..."
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
	echo "$USER ALL = NOPASSWD: /bin/systemctl" >> /etc/sudoers
	chmod 440 /etc/sudoers
fi

# add cardano/bin folder to PATH
grep -qF '/cardano/bin' $HOME/.bashrc
if [ $? -ne 0 ];then
	echo "export PATH=$HOME/cardano/bin:$PATH" >> $HOME/.bashrc
fi


