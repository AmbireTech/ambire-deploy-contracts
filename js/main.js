import { rawTxns } from './txn.js';

var app = new Vue({
	el: '#app',
	data: {
		isLive: true,
		remaining: '',
		web3: { account: null, pending: false, fatalErr: '' },
		chainId: '',
		nonce: '',
		currentTxn: ''
	},
	methods: {
		connect: async function (event) {
			this.web3.pending = true
			try {
				if (typeof window.ethereum === 'undefined') {
					throw new Error('MetaMask not available')
				}

				const [accounts, chainId] = await Promise.all([
					ethereum.request({ method: 'eth_requestAccounts' }),
					ethereum.request({ method: 'eth_chainId' })
				])
				this.chainId = chainId
				this.web3.account = accounts[0]
				const nonce = parseInt(await ethereum.request({ method: 'eth_getTransactionCount', params: [this.web3.account, 'pending'] })) //  'pending'
				this.nonce = nonce
			} catch(err) {
				console.error(err)
				this.web3.fatalErr = err.message || err
			}
			this.web3.pending = false
		},
		deploy: async function (event) {
			const nonce = await ethereum.request({ method: 'eth_getTransactionCount', params: [this.web3.account, 'pending'] }) //  'pending'
			this.nonce = parseInt(nonce)
			alert('nonce: ' + parseInt(nonce) + ":" + nonce)
			if (rawTxns[parseInt(nonce)] || rawTxns[parseInt(nonce)] === null) {
				const params = {
					from: this.web3.account,
					to: rawTxns[parseInt(nonce)] ? null : this.web3.account,
					data: rawTxns[parseInt(nonce)],
					value: '0x0',
					nonce: nonce.toString(16)
				}
				const txn = await ethereum.request({ 
					method: 'eth_sendTransaction',
					params: [params]
				})
				this.currentTxn = txn
				this.nonce = parseInt(await ethereum.request({ method: 'eth_getTransactionCount', params: [this.web3.account, 'pending'] })) //  'pending'
			} else {
				window.alert("no txn for this nonce: " + parseInt(nonce))
			}
		},
		getNonce: async function (event) {
			const nonce = await ethereum.request({ method: 'eth_getTransactionCount', params: [this.web3.account, 'pending'] })
			this.nonce = parseInt(nonce)
			window.alert(this.web3.account + '<------>' + parseInt(nonce))
		}
	}
})

// Just reload if something changes
ethereum.on('accountsChanged', (accounts) => {
	// can't do this cause it will reload right after conn
	//window.location.reload()
})

ethereum.on('chainChanged', (chainId) => {
	app.data.chainId = chainId
	window.location.reload()
})
