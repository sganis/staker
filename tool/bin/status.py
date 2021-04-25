#!/usr/bin/env python3
#
# get system status
import sys
import os
import subprocess
import json
from datetime import datetime
import re

DIR = os.path.dirname(os.path.abspath(sys.argv[0]))

# status codes:
# 0, n/a, not installed
# 1, ok, running, in sync
# 2, bad, stopped, not sync

def run(cmd, timeout=2):
    p = subprocess.run(cmd, shell=True,encoding='utf8',timeout=timeout,
       stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    return p.stdout.strip(),p.stderr.strip()
 
def get_cpu():
    o,e = run('uptime')
    f = o.split('average: ')[1].split(',')
    return float(f[0])
 
def get_memory():
    o,e = run('free|grep Mem:')
    f = o.split()
    used = int(f[2])
    total = int(f[1])
    return used,total
 
def get_disk():
    o,e = run('df /')
    f = o.split('\n')[-1].split()
    used = int(f[2])
    total = int(f[1])
    return used, total

def get_network_information():
# {
#     "network_tip.": {
#         "time": "2021-04-21T04:15:01Z",
#         "epoch_number": 127,
#         "absolute_slot_number": 24609285,
#         "slot_number": 114885
#     },
#     "node_era": "mary",
#     "node_tip": {
#         "height": {
#             "quantity": 2512125,
#             "unit": "block"
#         },
#         "time": "2021-04-21T04:14:14Z",
#         "epoch_number": 127,
#         "absolute_slot_number": 24609238,
#         "slot_number": 114838
#     },
#     "sync_progress": {
#         "status": "ready"
#     },
#     "next_epoch": {
#         "epoch_start_time": "2021-04-24T20:20:16Z",
#         "epoch_number": 128
#     }
# }
    cmd = 'timeout 1 cardano-wallet network information'
    o,e = run(cmd)
    if o:
        return json.loads(o.strip())
    return {}

def get_services_information():
    node = {}
    wallet = {}
    node['status'] = 0
    node['cmd'] = ''
    wallet['status'] = 0
    wallet['cmd'] = ''

    if os.path.exists(DIR + '/cardano-node'):
        node['status'] = 2 # stopped

    if os.path.exists(DIR + '/cardano-wallet'):
        wallet['status'] = 2

    if node['status'] > 0:    
    
        o,e = run(r"ps aux |grep ' cardano-'|grep -v grep")
        for line in o.split('\n'):
            if 'cardano-node' in line:
                f = line.split()
                if len(f) < 2: continue
                node['user'] = f[0]
                node['pid'] = f[1]
                node['status'] = 1
                m = re.match(r'.+(cardano-node.+)', line)
                if m:
                    node['cmd'] = m.group(1)
            if 'cardano-wallet' in line:
                f = line.split()
                if len(f) < 2: continue
                wallet['user'] = f[0]
                wallet['pid'] = f[1]
                wallet['status'] = 1
                m = re.match(r'.+(cardano-wallet.+)', line)
                if m:
                    wallet['cmd'] = m.group(1)
    return {'node_service': node, 'wallet_service': wallet}

services = get_services_information()
# print(services)
node_service = services['node_service']
wallet_service = services['wallet_service']

node_role = ('PRODUCER' if 'operational-certificate' in node_service['cmd'] 
              else 'RELAY' if node_service['cmd']
              else 'n/a')
time_sync = 0
node_sync = 0
node_status = node_service['status']
wallet_status = wallet_service['status']
network_time = ''
node_time = ''

if wallet_status == 1: # running
    netinfo = get_network_information()
    if netinfo:
        network_time = netinfo['network_tip']['time']
        node_time = netinfo['node_tip']['time']
        network_time_d = datetime.strptime(network_time, '%Y-%m-%dT%H:%M:%SZ')
        node_time_d    = datetime.strptime(node_time, '%Y-%m-%dT%H:%M:%SZ')
        time_sync = 1
        if (network_time_d - node_time_d).total_seconds() > 60:
            # print(network_time)
            # print(node_time)
            time_sync = 2
        if netinfo['sync_progress']['status'] == 'ready' :
            node_sync = 100
        else:
            node_sync = netinfo['sync_progress']['progress']['quantity']   



status = {
    'cpu': get_cpu(),
    'memory': get_memory(),
    'disk': get_disk(),
    'node_role': node_role,      
    'node_status': node_status,      
    'node_sync': node_sync,    
    'node_service': node_service,
    'wallet_service': wallet_service,  
    'wallet_status': wallet_status,
    'time_sync': time_sync,
    'network_time': network_time,
    'node_time': node_time,

}
 
print(json.dumps(status))