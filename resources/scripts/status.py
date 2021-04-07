#!/usr/bin/env python3
#
# get system status
import subprocess
import json
 
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
    avail = int(f[1])
    return used,avail
 
def get_disk():
    o,e = run('df /')
    f = o.split('\n')[-1].split()
    used = int(f[2])
    avail = int(f[3])
    return used, avail
 
 
status = {
    'cpu': get_cpu(),
    'memory': get_memory(),
    'disk': get_disk(),
}
 
print(json.dumps(status))