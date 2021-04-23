#!/usr/bin/env python3
#
# create transaction
import sys
import os
import subprocess
import json
import argparse

home = os.environ['HOME']
#path_to_socket = f"{home}/ada/relay/db/node.socket"
DIR = os.path.dirname(os.path.abspath(sys.argv[0]))
KEYDIR = f'{home}/.staker/keys'

NETWORK='--testnet-magic 1097911063'
# NETWORK='--testnet-magic 3'

def run(cmd):
#	os.environ["CARDANO_NODE_SOCKET_PATH"] = path_to_socket
	cmd = cmd.replace('\n','')
	#print(f'CMD: {cmd}')
	p = subprocess.run(cmd.replace('\n','').split(), capture_output=True)
	stdout = p.stdout.decode().strip()
	stderr = p.stderr.decode().strip()
	return stdout, stderr

def _get_protocol():
	cmd = f'''cardano-cli query protocol-parameters--out-file protocol.json {NETWORK} --mary-era'''
	run(cmd)

def _get_tx_hash(addr):
	cmd = f'''cardano-cli query utxo --address {addr} {NETWORK} --mary-era'''
	o,e = run(cmd)
	# print(o)
	line = o.split('\n')[-1].split()
	# hash, index, balance
	return line[0], line[1], int(line[2])

def _calculate_min_fee(tx_out_count, witness_count):
	cmd = 'cardano-cli transaction calculate-min-fee '
	cmd += '--tx-body-file tx.draft --tx-in-count 1 '
	cmd += f'--tx-out-count {tx_out_count} --witness-count {witness_count} '
	cmd += '--byron-witness-count 0 --protocol-params-file protocol.json '
	cmd += f'{NETWORK}'
	o,e = run(cmd)
	return int(o.split()[0])

def _get_tip_slot_number():
	cmd  = f'cardano-cli query tip {NETWORK}'
	o, e = run(cmd)
	js = json.loads(o)
	return int(js['slotNo'])

def _get_ttl():
	# ttl
	return _get_tip_slot_number() + 200

def _get_key_deposit():
	js = json.loads(open('protocol.json').read())
	return int(js['keyDeposit'])

def _get_pool_deposit():
	js = json.loads(open('protocol.json').read())
	return int(js['poolDeposit'])

def _get_args():
	parser = argparse.ArgumentParser()
	# parser.add_argument('--tx', action='store_true', help='make a transaction')
	subparsers = parser.add_subparsers(dest='command')
	subparsers.required = True
	s = subparsers.add_parser("tx", help='make a transaction')
	s.add_argument("--from_addr", required=True, help="from address")
	s.add_argument("--from_skey", required=True, help="from signing key")
	s.add_argument("--to_addr", required=True, help="to address")
	s.add_argument("--ada", required=True, help="ammount of ADA to send")
	s = subparsers.add_parser("address", help='generate payment and stake addresses')
	s.add_argument("--name", help="address name")
	s.add_argument("--list", action='store_true', help="list all addresses")
	s = subparsers.add_parser("balance", help='query balance of address')
	s.add_argument("--name", help="address name")
	
	# Parse
	a = parser.parse_args()

	if a.command == 'address' and not a.name and not a.list:
		parser.error('address must request --name or --list')
	
	return a

def get_addresses():
	if not os.path.exists(KEYDIR):
		sys.stderr.write(f'key dir does not exist.\n')
		return False
	addr = []
	for f in os.listdir(KEYDIR):
		if '_paymt.addr' in f:
			with open(f'{KEYDIR}/{f}') as r:
				address = r.read()
				name = f.replace('_paymt.addr','')
				a = {'name': name, 'address': address}
				addr.append(a)
	print(json.dumps(addr))

def address(name):
	if os.path.exists(f'{KEYDIR}/{name}_paymt.addr'):
		sys.stderr.write('already exists, not generating.\n')
		return False
	# print(f'generating payment address...')
	# make payment keys
	cmd = f'cardano-cli address key-gen '
	cmd += f'--verification-key-file {KEYDIR}/{name}_paymt.vkey '
	cmd += f'--signing-key-file {KEYDIR}/{name}_paymt.skey'
	run(cmd)
	# stake key pair
	cmd = f'cardano-cli stake-address key-gen '
	cmd +=f'--verification-key-file {KEYDIR}/{name}_stake.vkey '
	cmd += f'--signing-key-file {KEYDIR}/{name}_stake.skey'
	run(cmd)
	# payment address
	cmd = f'cardano-cli address build '
	cmd += f'--payment-verification-key-file {KEYDIR}/{name}_paymt.vkey '
	cmd += f'--stake-verification-key-file {KEYDIR}/{name}_stake.vkey '
	cmd += f'--out-file {KEYDIR}/{name}_paymt.addr {NETWORK}'
	run(cmd)
	# stake address
	cmd = 'cardano-cli stake-address build '
	cmd += f'--stake-verification-key-file {name}_stake.vkey '
	cmd += f'--out-file {name}_stake.addr {NETWORK}'
	run(cmd)
	print(open(f'{KEYDIR}/{name}_paymt.addr').read())
	# print('done.')
	return True

def balance(name):
	addr_file = f'{KEYDIR}/{name}_paymt.addr'
	if not os.path.exists(addr_file):
		sys.stderr.write('invalid address.\n')
		return False
	addr = open(addr_file).read()
	cmd = f'cardano-cli query utxo --address {addr} {NETWORK} --mary-era'
	o,e=run(cmd)
	if e:
		sys.stderr.write(e)
		return False
	else:
		try:
			line = o.split('\n')[-1].split()
			balance = int(line[2])/1000000.0
			print(balance)
			return True
		except Exception as ex:
			print('n/a')
			return False 

def send(from_addr, to_addr, ada, from_skey):
	print(f'sending {ada} ADA\nFrom: {from_addr}\nTo  : {to_addr}')
	_get_protocol()
	txhash, txtx, balance = _get_tx_hash(from_addr)
	cmd = 'cardano-cli transaction build-raw '
	cmd += f'--tx-in {txhash}#{txtx} '
	cmd += f'--tx-out {to_addr}+0 '
	cmd += f'--tx-out {from_addr}+0 '
	cmd += '--invalid-hereafter 0 --fee 0 --out-file tx.draft'
	run(cmd)
	lovelaces = int(ada) * 1_000_000
	fee = _calculate_min_fee(2, 1)
	ttl = _get_ttl()
	change = balance - lovelaces - fee
	cmd = 'cardano-cli transaction build-raw '
	cmd += f'--tx-in {txhash}#{txtx} '
	cmd += f'--tx-out {to_addr}+{lovelaces} '
	cmd += f'--tx-out {from_addr}+{change} '
	cmd += f'--invalid-hereafter {ttl} '
	cmd += f'--fee {fee} --out-file tx.raw'
	o,e = run(cmd)
	print(o)

	cmd = 'cardano-cli transaction sign --tx-body-file tx.raw '
	cmd += f'--signing-key-file {from_skey} --out-file tx.signed {NETWORK}'
	o,e = run(cmd)
	
	o,e = run(f'cardano-cli transaction submit --tx-file tx.signed {NETWORK}')
	print(o)
	if e:
		print(f'error: {e}')

	print(_get_tx_hash(from_addr))
	print(_get_tx_hash(to_addr))

def register(stake_addr_file, stake_skey_file, stake_vkey_file, payment_addr_file, payment_skey_file):
	stake_addr = open(stake_addr_file).read()
	stake_skey = open(stake_addr_file).read()
	payment_addr = open(payment_addr_file).read()
	payment_skey = open(payment_skey_file).read()

	# create certificatge
	cmd = 'cardano-cli stake-address registration-certificate '
	cmd += f'--stake-verification-key-file {stake_vkey_file} --out-file stake.cert'
	o,e = run(cmd)

	_get_protocol()
	txhash, txtx, balance = _get_tx_hash(payment_addr)
	cmd = 'cardano-cli transaction build-raw '
	cmd += f'--tx-in {txhash}#{txtx} '
	cmd += f'--tx-out {payment_addr}+0 '
	cmd += '--invalid-hereafter 0 --fee 0 --out-file tx.draft '
	cmd += '--certificate-file stake.cert'
	run(cmd)
	fee = _calculate_min_fee(1, 2)
	print(f'fee: {fee}')
	deposit = get_deposit()
	print(f'deposit: {deposit}')

	change = balance - fee - deposit

	ttl = _get_ttl()

	cmd = 'cardano-cli transaction build-raw '
	cmd += f'--tx-in {txhash}#{txtx} '
	cmd += f'--tx-out {payment_addr}+{change} '
	cmd += f'--invalid-hereafter {ttl} '
	cmd += f'--fee {fee} --out-file tx.raw '
	cmd += '--certificate-file stake.cert'
	o,e = run(cmd)

	cmd = 'cardano-cli transaction sign --tx-body-file tx.raw '
	cmd += f'--signing-key-file {payment_skey_file} '
	cmd += f'--signing-key-file {stake_skey_file} '
	cmd += f'--out-file tx.signed {NETWORK}'
	o,e = run(cmd)

	o,e = run(f'cardano-cli transaction submit --tx-file tx.signed {NETWORK}')
	print(o)
	if e:
		print(f'error: {e}')

	print(_get_tx_hash(payment_addr))

def generate_pool_keys():
	cmd = '''cardano-cli node key-gen 
		--cold-verification-key-file cold.vkey 
		--cold-signing-key-file cold.skey 
		--operational-certificate-issue-counter-file cold.counter'''
	run(cmd)
	cmd = '''cardano-cli node key-gen-VRF 
		--verification-key-file vrf.vkey 
		--signing-key-file vrf.skey'''
	run(cmd)
	cmd = '''cardano-cli node key-gen-KES 
		--verification-key-file kes.vkey 
		--signing-key-file kes.skey'''
	run(cmd)
	js = json.loads(open('../relay/testnet-shelley-genesis.json').read())
	slots_per_kes = js['slotsPerKESPeriod']
	print(slots_per_kes)
	slot_no = _get_tip_slot_number()
	print(slot_no)
	kes_period = int(slot_no / slots_per_kes)
	print(kes_period)

	cmd = 'cardano-cli node issue-op-cert '
	cmd += '--kes-verification-key-file kes.vkey '
	cmd += '--cold-signing-key-file cold.skey '
	cmd += '--operational-certificate-issue-counter cold.counter '
	cmd += f'--kes-period {kes_period} '
	cmd += '--out-file node.cert'
	run(cmd)

def register_pool():

	payment_addr = open('payment.addr').read()
	payment_skey = open('payment.skey').read()

	cmd ='cardano-cli stake-pool metadata-hash --pool-metadata-file cardano/poolMetadata.json'
	o,e = run(cmd)
	metadata_hash = o.strip()
	pledge = 500 * 1_000_000
	cost = 340 * 1_000_000
	margin = 0.03
	metadata_url = 'https://git.io/JmApG'
	relay_dns = "adapool.chaintrust.com"

	cmd = 'cardano-cli stake-pool registration-certificate '
	cmd += '--cold-verification-key-file cold.vkey '
	cmd += '--vrf-verification-key-file vrf.vkey '
	cmd += f'--pool-pledge {pledge} '
	cmd += f'--pool-cost {cost} '
	cmd += f'--pool-margin {margin} '
	cmd += '--pool-reward-account-verification-key-file stake.vkey '
	cmd += '--pool-owner-stake-verification-key-file stake.vkey '
	cmd += f'--single-host-pool-relay {relay_dns} '
	cmd += '--pool-relay-port 3001 '
	cmd += f'--metadata-url {metadata_url} '
	cmd += f'--metadata-hash {metadata_hash} '
	cmd += f'--out-file pool-registration.cert {NETWORK}'
	o,e = run(cmd)

	cmd = '''cardano-cli stake-address delegation-certificate 
		--stake-verification-key-file stake.vkey 
		--cold-verification-key-file cold.vkey 
		--out-file delegation.cert'''
	run(cmd)


	_get_protocol()
	txhash, txtx, balance = _get_tx_hash(payment_addr)

	cmd = 'cardano-cli transaction build-raw '
	cmd += f'--tx-in {txhash}#{txtx} '
	cmd += f'--tx-out {payment_addr}+0 '
	cmd += '--invalid-hereafter 0 --fee 0 --out-file tx.draft '
	cmd += '--certificate-file pool-registration.cert '
	cmd += '--certificate-file delegation.cert'
	run(cmd)

	fee = _calculate_min_fee(1, 3)
	print(f'fee: {fee}')
	deposit = _get_pool_deposit()
	print(f'deposit: {deposit}')

	change = balance - fee - deposit

	ttl = _get_ttl()

	cmd = 'cardano-cli transaction build-raw '
	cmd += f'--tx-in {txhash}#{txtx} '
	cmd += f'--tx-out {payment_addr}+{change} '
	cmd += f'--invalid-hereafter {ttl} '
	cmd += f'--fee {fee} --out-file tx.raw '
	cmd += '--certificate-file pool-registration.cert '
	cmd += '--certificate-file delegation.cert'
	o,e = run(cmd)

	cmd = 'cardano-cli transaction sign --tx-body-file tx.raw '
	cmd += '--signing-key-file payment.skey '
	cmd += '--signing-key-file stake.skey '
	cmd += '--signing-key-file cold.skey '
	cmd += f'--out-file tx.signed {NETWORK}'
	o,e = run(cmd)

	o,e = run(f'cardano-cli transaction submit --tx-file tx.signed {NETWORK}')
	print(o)
	if e:
		print(f'error: {e}')
	# verify
	# poolId=`cardano-cli stake-pool id --cold-verification-key-file cold.vkey --output-format "hex"`
	# cardano-cli query ledger-state {NETWORK} --mary-era | grep publicKey | grep <poolId>


if __name__ == '__main__':

	o,e = run('cardano-wallet address list 377b5fb2b90a5f937b1a72b309787fb1e26e28ba')
	addresses = json.loads(o)
	a_count = len(addresses)
	total = 0

	for i,a in enumerate(addresses):
		a_id = a['id']
		a_state = a['state']
		o,e = run(f'cardano-cli query utxo --address {a_id} --testnet-magic 1097911063 --mary-era')
		balance = 0
		for line in o.split('\n'):
			if line.startswith('TxHash') or line.startswith('----'):
				continue
			f = line.split()
			if len(f)>2:
				balance += int(f[2])
		total += balance
		if balance > 0:
			print(i)
			print(a_id)
			print(f'state: {a_state}, balance: {balance}')

	print(f'wallet balance: {total}')
	print(f'addresses: {a_count}')
	


	# p = _get_args()

	# ok = False
	# if p.command == 'tx':
	# 	ok = send(p.from_addr, p.to_addr, p.ada, p.from_skey)	
	# elif p.command == 'address':
	# 	if p.name:
	# 		ok = address(p.name)
	# 	elif p.list:
	# 		ok = get_addresses()
	# elif p.command == 'balance':
	# 	ok = balance(p.name)

	# sys.exit(0 if ok else 1)

	# assert len(sys.argv) > 3  # usage: prog <from> <to> <ada_amount>
	# from_addr = open(sys.argv[1]).read()
	# to_addr = open(sys.argv[2]).read()
	# ada = sys.argv[3]
	# from_skey = sys.argv[1].split('.')[0] + '.skey'
	#send(from_addr, to_addr, ada, from_skey)

	# register stake address
	# payment_addr_file = 'payment.addr'
	# payment_skey_file = payment_addr_file.split('.')[0] + '.skey'
		
	# stake_addr_file = 'stake.addr'
	# stake_skey_file = stake_addr_file.split('.')[0] + '.skey'
	# stake_vkey_file = stake_addr_file.split('.')[0] + '.vkey'

	# register(stake_addr_file, stake_skey_file, stake_vkey_file,
	# 	 payment_addr_file, payment_skey_file)

	# generate stake pool keys
	#generate_pool_keys()

	# register stake pool
	# register_pool()