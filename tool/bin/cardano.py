#!/usr/bin/env python3
#
# Cardano stake pool operations
import sys
import os
import subprocess
import json
import argparse
from shutil import copyfile
from datetime import datetime

home = os.environ['HOME']
DIR = os.path.dirname(os.path.abspath(sys.argv[0]))
ROOT=f'{home}/cardano'
CONF=f'{ROOT}/config'
KEYS = f'{ROOT}/keys'
WALLETS = f'{ROOT}/wallets'
KEYFILES = ['cold.skey','cold.vkey','cold.counter','vrf.skey','vrf.vkey','kes.skey','kes.vkey','node.cert']
NETWORK='--testnet-magic 1097911063'
os.environ["CARDANO_NODE_SOCKET_PATH"] = f'{ROOT}/node.socket'

def run(cmd):
	cmd = cmd.replace('\n','')
	# print(f'CMD: {cmd}')
	p = subprocess.run(cmd.replace('\n',' ').split(), encoding='utf8', 
			stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	stdout = p.stdout.strip()
	stderr = p.stderr.strip()
	return stdout, stderr

def _get_protocol():
	cmd = f'{DIR}/cardano-cli query protocol-parameters --out-file {CONF}/protocol.json {NETWORK}'
	o,e = run(cmd)
	if e:
		print(e, file=sys.stderr)

def _get_utxo(addr):
	cmd = f'''cardano-cli query utxo --address {addr} {NETWORK}'''
	o,e = run(cmd)
	if e:
		print(e, file=sys.stderr)
	# print(o)
	lines = o.split('\n')[2:]
	utxo = []
	for line in lines:
		# hash, index, balance
		f = line.split()
		if len(f) > 2:
			utxo.append(f)
	return utxo

def _calculate_min_fee(tx_in_count, tx_out_count, witness_count):
	cmd = f'{DIR}/cardano-cli transaction calculate-min-fee '
	cmd += f'--tx-body-file {KEYS}/tx.draft '
	cmd += f'--tx-in-count {tx_in_count} '
	cmd += f'--tx-out-count {tx_out_count} '
	cmd += f'--witness-count {witness_count} '
	cmd += f'--byron-witness-count 0 --protocol-params-file {CONF}/protocol.json '
	cmd += f'{NETWORK}'
	print(cmd)
	o,e = run(cmd)
	return int(o.split()[0])

def _get_tip_slot_number():
	cmd  = f'{DIR}/cardano-cli query tip {NETWORK}'
	o, e = run(cmd)
	js = json.loads(o)
	# print(js)
	return int(js['slot'])

def _get_ttl():
	# ttl
	return _get_tip_slot_number() + 200

def _get_key_deposit():
	js = json.loads(open(f'{CONF}/protocol.json').read())
	return int(js['keyDeposit'])

def _get_pool_deposit():
	js = json.loads(open(f'{CONF}/protocol.json').read())
	return int(js['stakePoolDeposit'])

def _get_params():
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
	s.add_argument("--address", required=True, help="address to query balance")

	s = subparsers.add_parser("pool-keys", help='get pool keys')
	s = subparsers.add_parser("generate-pool-keys", help='generate pool keys')
	s.add_argument("--type", required=True, help="generate cold, vrf, kes, and cert keys")

	s = subparsers.add_parser("pool-params", help='get pool params')
	s.add_argument("--pool-id", required=True, help="pool id")

	s = subparsers.add_parser("stake-snapshot", help='get stake snapshot')
	s.add_argument("--pool-id", required=True, help="pool id")

	s = subparsers.add_parser("stake-address-info", help='get stake address info')
	s.add_argument("--address", required=True, help="stake address")

	s = subparsers.add_parser("register-pool", help='register pool')
	s.add_argument("--pledge", required=True, help="pledge in ADA")
	s.add_argument("--margin", required=True, help="margin percent")
	s.add_argument("--cost", required=True, help="cost in ADA")
	s.add_argument("--wallet-id", required=True, help="wallet id of payment and stake")

	s = subparsers.add_parser("version", help='get version')
	
	# Parse
	a = parser.parse_args()

	if a.command == 'address' and not a.name and not a.list:
		parser.error('address must request --name or --list')
	
	return a

def address(name):
	if os.path.exists(f'{KEYDIR}/{name}_paymt.addr'):
		print('already exists, not generating.', file=sys.stderr)
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

def balance(address):
	lovelaces = 0
	utxo = _get_utxo(address)
	for u in utxo:
		lovelaces += int(u[2])
	print(lovelaces/1_000_000.0)
	return True 

def send(from_addr, to_addr, ada, from_skey):
	print(f'sending {ada} ADA\nFrom: {from_addr}\nTo  : {to_addr}')
	_get_protocol()
	balance = 0
	utxo = _get_utxo(from_addr)
	tx_in = ''
	tx_in_count = 0
	lovelaces = int(float(ada) * 1_000_000)
	min_input = lovelaces + 2_000_000

	for u in utxo:
		txhash = u[0]
		idx = u[1]
		tx_in += f'--tx-in {txhash}#{idx} '
		tx_in_count += 1
		balance += int(u[2])
		if balance > min_input:
			break

	cmd = f'{DIR}/cardano-cli transaction build-raw '
	cmd += f'{tx_in}'
	cmd += f'--tx-out {to_addr}+0 '
	cmd += f'--tx-out {from_addr}+0 '
	cmd += '--invalid-hereafter 0 --fee 0 --out-file tx.draft'
	# print(cmd)
	run(cmd)
	
	fee = _calculate_min_fee(tx_in_count, 2, 1)
	ttl = _get_ttl()

	change = int(balance - lovelaces - fee)
	assert change > 1_000_000 # minimum output today
	
	cmd = 'cardano-cli transaction build-raw '
	cmd += f'{tx_in}'
	cmd += f'--tx-out {to_addr}+{lovelaces} '
	cmd += f'--tx-out {from_addr}+{change} '
	cmd += f'--invalid-hereafter {ttl} '
	cmd += f'--fee {fee} --out-file tx.raw'
	print(cmd)
	o,e = run(cmd)
	
	cmd = 'cardano-cli transaction sign --tx-body-file tx.raw '
	cmd += f'--signing-key-file {from_skey} --out-file tx.signed {NETWORK}'
	print(cmd)
	o,e = run(cmd)
	
	o,e = run(f'cardano-cli transaction submit --tx-file tx.signed {NETWORK}')
	print(o)
	if e:
		print(f'error: {e}')
	
	# cleanup
	run('rm protocol.json tx.draft tx.raw tx.signed')

	print(_get_utxo(from_addr))
	print(_get_utxo(to_addr))

def register_stake_address(stake_addr_file, stake_skey_file, stake_vkey_file, payment_addr_file, payment_skey_file):
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

def _backup_keys():
	now = datetime.now().strftime('%Y%m%d%H%M%S')
	o,e = run(f'mkdir -p {KEYS}/backup/{now}')
	if e:
		print(e, file=sys.stderr)
		return False
	for f in KEYFILES:
		if os.path.exists(f'{KEYS}/{f}'): 
			try:
				copyfile(f'{KEYS}/{f}', f'{KEYS}/backup/{now}/{f}')
			except Exception as ex:
				print(ex, file=sys.stderr)
				return False
	return True

def get_pool_keys():
	keys = []
	files = os.listdir(f'{KEYS}')
	for i,f in enumerate(KEYFILES):
		key = {}
		key['name'] = f
		key['order'] = i
		key['mtime'] = 'N/A'
		key['content'] = ''
		if f in files: 
			s = os.stat(f'{KEYS}/{f}')
			# key['mtime'] = datetime.fromtimestamp(s.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
			d1 = datetime.fromtimestamp(s.st_mtime)
			d2 = datetime.now()
			delta = d2 - d1
			key['mtime'] = d1.strftime('%Y-%m-%d %H:%M:%S')
			key['days'] = delta.days

			with open(f'{KEYS}/{f}') as r:
				key['content'] = r.read() 
		keys.append(key)
	print(json.dumps(keys))
	return True

def generate_pool_keys(types):
	_backup_keys()		
	if 'cold' in types:
		cmd = f'{DIR}/cardano-cli node key-gen '
		cmd += f'--cold-verification-key-file {KEYS}/cold.vkey --cold-signing-key-file {KEYS}/cold.skey '
		cmd += f'--operational-certificate-issue-counter-file {KEYS}/cold.counter'
		o,e = run(cmd)
		if e: 
			print(e, file=sys.stderr)
			return False

	if 'vrf' in types:
		cmd = f'{DIR}/cardano-cli node key-gen-VRF '
		cmd += f'--verification-key-file {KEYS}/vrf.vkey --signing-key-file {KEYS}/vrf.skey'
		o,e = run(cmd)
		if e: 
			print(e, file=sys.stderr)
			return False

	if 'kes' in types:
		cmd = f'{DIR}/cardano-cli node key-gen-KES '
		cmd += f'--verification-key-file {KEYS}/kes.vkey --signing-key-file {KEYS}/kes.skey'
		o,e = run(cmd)
		if e: 
			print(e, file=sys.stderr)
			return False

	if 'cert' in types:
		error = []
		if not os.path.exists(f'{KEYS}/cold.skey'):
			error.append('cold.skey is required')
		if not os.path.exists(f'{KEYS}/kes.vkey'):
			error.append('kes.vkey is required')
		if not os.path.exists(f'{KEYS}/cold.counter'):
			error.append('cold.counter is required')			
			
		if len(error) > 0:
			print('\n'.join(error), file=sys.stderr)
			return False

		js = json.loads(open(f'{CONF}/testnet-shelley-genesis.json').read())
		slots_per_kes = js['slotsPerKESPeriod']
		slot_no = _get_tip_slot_number()
		kes_period = int(slot_no / slots_per_kes)
		cmd = f'{DIR}/cardano-cli node issue-op-cert '
		cmd += f'--kes-verification-key-file {KEYS}/kes.vkey '
		cmd += f'--cold-signing-key-file {KEYS}/cold.skey '
		cmd += f'--operational-certificate-issue-counter {KEYS}/cold.counter '
		cmd += f'--kes-period {kes_period} --out-file {KEYS}/node.cert'
		o,e = run(cmd)
		if e: 
			print(e, file=sys.stderr)
			return False
	return True

def _get_metadata_hash():
	cmd = f'{DIR}/cardano-cli stake-pool metadata-hash --pool-metadata-file {CONF}/pool-metadata.json'
	o,e = run(cmd)
	if o:
		return o
	else:
		print(e, file=sys.stderr)
		return ''

def _get_metadata_url():
	o,e = run(f'cat {CONF}/pool-metadata.url')
	if e:
		print(e, file=sys.stderr)
	return o

def register_pool(pledge, margin, cost, wallet_id):

	WALLET = f'{WALLETS}/{wallet_id}'
	payment_addr = open(f'{WALLET}/payment.addr').read()
	metadata_hash = _get_metadata_hash()
	pledge = int(pledge) * 1_000_000
	cost = int(cost) * 1_000_000
	metadata_url = _get_metadata_url()
	relay_dns = "adapool.chaintrust.com"

	_get_protocol()
	deposit = _get_pool_deposit()
	# print(f'deposit: {deposit}')


	cmd = f'{DIR}/cardano-cli stake-pool registration-certificate '
	cmd += f'--cold-verification-key-file {KEYS}/cold.vkey '
	cmd += f'--vrf-verification-key-file {KEYS}/vrf.vkey '
	cmd += f'--pool-pledge {pledge} '
	cmd += f'--pool-cost {cost} '
	cmd += f'--pool-margin {margin} '
	cmd += f'--pool-reward-account-verification-key-file {WALLET}/stake.vkey '
	cmd += f'--pool-owner-stake-verification-key-file {WALLET}/stake.vkey '
	cmd += f'--single-host-pool-relay {relay_dns} '
	cmd += '--pool-relay-port 3001 '
	cmd += f'--metadata-url {metadata_url} '
	cmd += f'--metadata-hash {metadata_hash} '
	cmd += f'--out-file {KEYS}/pool-registration.cert {NETWORK}'
	print(cmd)
	print()
	o,e = run(cmd)
	if e:
		print(e, file=sys.stderr)
		return False

	# delegation certificates for each owner
	cmd = f'{DIR}/cardano-cli stake-address delegation-certificate '
	cmd += f'--stake-verification-key-file {WALLET}/stake.vkey '
	cmd += f'--cold-verification-key-file {KEYS}/cold.vkey '
	cmd += f'--out-file {KEYS}/delegation.cert'
	print(cmd)
	print()
	o,e = run(cmd)
	if e:
		print(e, file=sys.stderr)
		return False

	balance = 0
	utxo = _get_utxo(payment_addr)
	print(utxo)
	tx_in = ''
	tx_in_count = 0

	for u in utxo:
		txhash = u[0]
		idx = u[1]
		tx_in += f'--tx-in {txhash}#{idx} '
		tx_in_count += 1
		balance += int(u[2])
	

	cmd = f'{DIR}/cardano-cli transaction build-raw '
	cmd += f'{tx_in}'
	cmd += f'--tx-out {payment_addr}+0 '
	cmd += f'--invalid-hereafter 0 --fee 0 --out-file {KEYS}/tx.draft '
	cmd += f'--certificate-file {KEYS}/pool-registration.cert '
	cmd += f'--certificate-file {KEYS}/delegation.cert'
	print(cmd)
	print()
	o,e = run(cmd)
	if e:
		print(e, file=sys.stderr)
		return False

	fee = _calculate_min_fee(tx_in_count, 1, 3)
	
	is_registered = True
	if is_registered:
		deposit = 0

	change = balance - fee - deposit
	print(f'balance: {balance}')
	print(f'deposit: {deposit}')
	print(f'fee    : {fee}')
	print(f'change : {change}')

	ttl = _get_ttl()

	cmd = f'{DIR}/cardano-cli transaction build-raw '
	cmd += f'{tx_in}'
	cmd += f'--tx-out {payment_addr}+{change} '
	cmd += f'--invalid-hereafter {ttl} '
	cmd += f'--fee {fee} --out-file {KEYS}/tx.raw '
	cmd += f'--certificate-file {KEYS}/pool-registration.cert '
	cmd += f'--certificate-file {KEYS}/delegation.cert'
	print(cmd)
	print()
	o,e = run(cmd)
	if e:
		print(e, file=sys.stderr)
		return False

	cmd = f'{DIR}/cardano-cli transaction sign --tx-body-file {KEYS}/tx.raw '
	cmd += f'--signing-key-file {WALLET}/payment.skey '
	cmd += f'--signing-key-file {WALLET}/stake.skey '
	cmd += f'--signing-key-file {KEYS}/cold.skey '
	cmd += f'--out-file {KEYS}/tx.signed {NETWORK}'
	print(cmd)
	print()
	o,e = run(cmd)
	if e:
		print(e, file=sys.stderr)
		return False
	cmd = f'{DIR}/cardano-cli transaction submit --tx-file {KEYS}/tx.signed {NETWORK}'
	print(cmd)
	print()
	
	o,e = run(cmd)
	if e:
		print(e, file=sys.stderr)
		return False
	return True

def _get_pool_id():
	o,e = run(f'cardano-cli stake-pool id --cold-verification-key-file {KEYS}/cold.vkey --output-format hex')
	if o:
		return o
	else:
		print(e, file=sys.stderr)
		return ''	

def is_pool_registered():
	nodekey = f'{KEYS}/cold.vkey'
	if not os.path.exists(nodekey):
		print(f'{nodekey} not found', file=sys.stderr)
		return False

	poolid = _get_pool_id()
	if poolid:
		o,e = run(f'{DIR}/cardano-cli query ledger-state {NETWORK} --mary-era') # | grep publicKey | grep {nodeid}')
		for line in o.split('\n'):
			if 'publicKey' in line and poolid in line:
				return True
	return False

def query_pool_params(pool_id):
	o,e = run(f'{DIR}/cardano-cli query pool-params --stake-pool-id {pool_id} {NETWORK}')
	if e:
		print(e, file=sys.stderr)
		return False
	print(o)
	return True

def query_stake_snapshot(pool_id):
	o,e = run(f'{DIR}/cardano-cli query stake-snapshot --stake-pool-id {pool_id} {NETWORK}')
	if e:
		print(e, file=sys.stderr)
		return False
	print(o)
	return True

def query_stake_address_info(address):
	o,e = run(f'{DIR}/cardano-cli query stake-address-info --address {address} {NETWORK}')
	if e:
		print(e, file=sys.stderr)
		return False
	print(o)
	return True

def query_version():
	version = {}
	version['cardano-cli'] = 'N/A'	
	version['cardano-node'] = 'N/A'	
	version['cardano-wallet'] = 'N/A'	
	o,e = run(f'{DIR}/cardano-cli --version')
	if e:
		print(e, file=sys.stderr)
	try:
		version['cardano-cli'] = o.split()[1]
	except:
		pass

	o,e = run(f'{DIR}/cardano-node --version')
	if e:
		print(e, file=sys.stderr)
	try: 
		version['cardano-node'] = o.split()[1]
	except:
		pass

	o,e = run(f'{DIR}/cardano-wallet version')
	if e:
		print(e, file=sys.stderr)
	try:
		version['cardano-wallet'] = o.split()[0]
	except:
		pass
		
	print(json.dumps(version))
	return True


if __name__ == '__main__':

	p = _get_params()

	ok = False
	if p.command == 'tx':
		ok = send(p.from_addr, p.to_addr, p.ada, p.from_skey)	

	elif p.command == 'address':
		if p.name:
			ok = address(p.name)
		elif p.list:
			ok = get_addresses()

	elif p.command == 'balance':
		ok = balance(p.address)

	elif p.command == 'pool-keys':
		ok = get_pool_keys()

	elif p.command == 'generate-pool-keys':
		types = p.type.split(',')
		for t in types:
			if not t in ['kes','vrf','cold','cert']:
				print('invalid key generation request')
		else:
			ok = generate_pool_keys(types)

	elif p.command == 'pool-params':
		ok = query_pool_params(p.pool_id)

	elif p.command == 'stake-snapshot':
		ok = query_stake_snapshot(p.pool_id)

	elif p.command == 'stake-address-info':
		ok = query_stake_address_info(p.address)

	elif p.command == 'register-pool':
		ok = register_pool(p.pledge, p.margin, p.cost, p.wallet_id)

	elif p.command == 'version':
		ok = query_version()




	sys.exit(0 if ok else 1)

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

	# register_stake_address(stake_addr_file, stake_skey_file, stake_vkey_file,
	# 	 payment_addr_file, payment_skey_file)

	# generate stake pool keys
	# generate_pool_keys()

	# register stake pool
	# register_pool()