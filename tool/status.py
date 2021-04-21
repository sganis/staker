#!/usr/bin/env python3
#
# get system status
import sys
import os
import subprocess
import json

DIR = os.path.dirname(os.path.abspath(sys.argv[0]))

def run(cmd):
    p = subprocess.run(cmd, shell=True,encoding='utf8',
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
 
def get_node_status():
    # 1: service not installed
    # 2: serivce stopped
    # 3: syncing
    # 4: ok
    if not os.path.exists(DIR + '/cardano-node'):
        return 1

    cmd = 'ps aux |grep cardano-node |grep -v grep|wc -l'
    o,e = run(cmd)
    if o == '0':
        return 2 # service stopped
    return 4
 
def get_wallet_status():
    # 1: service not installed
    # 2: serivce stopped
    # 3: syncing
    # 4: ok
    if not os.path.exists(DIR + '/cardano-wallet'):
        return 1

    cmd = 'ps aux |grep cardano-wallet |grep -v grep|wc -l'
    o,e = run(cmd)
    if o == '0':
        return 2 # service stopped
    return 4

def get_time_status():
    return 2


status = {
    'cpu': get_cpu(),
    'memory': get_memory(),
    'disk': get_disk(),
    'node_status': get_node_status(),      
    'wallet_status': get_wallet_status(),
    'time_status': get_time_status(),
}
 
print(json.dumps(status))