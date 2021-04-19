#!/bin/bash
sudo bash -c "cat << 'EOF' > /etc/systemd/system/cardano.service
[Unit]
Description=Cardano Node
After=network.target

[Service]
Type=simple
Restart=on-failure
RestartSec=5
User=$USER
LimitNOFILE=1048576
WorkingDirectory=$HOME/cardano/relay
ExecStart=/bin/bash -l -c \"exec $HOME/cardano/bin/start_node.sh\"
ExecStop=/bin/bash -l -c \"exec kill -2 \$(ps -ef | grep [c]ardano-node | tr -s ' ' | cut -d ' ' -f2)\"
KillSignal=SIGINT
SuccessExitStatus=143
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=cardano
TimeoutStopSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl enable cardano.service