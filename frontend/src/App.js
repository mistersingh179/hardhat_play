import logo from './logo.svg';
import './App.css';
import React from 'react'
import {Button, Col, Container, Form, FormControl, InputGroup, Row} from "react-bootstrap";
import MetamaskConnection from "./components/MetamaskConnection"
import {ethers} from 'ethers'
window.ethers = ethers

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      walletAddress: "",
      chainId: "",
      balance: "",
      provider: ""
    }


    this._updateWalletAddress = this._updateWalletAddress.bind(this)
    this._updateChainId = this._updateChainId.bind(this)
    this._getBalance = this._getBalance.bind(this)
    this._init = this._init.bind(this)
  }

  componentDidMount(){
    this._init()
  }

  async _init(){
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    this._updateChainId(chainId)
    this._setupProvider()

    window.ethereum.on('chainChanged', (chainId) => {
      this._updateChainId(chainId)
      this._setupProvider()
      this._getBalance()
    })
  }

  _setupProvider(){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    this.setState({provider})
    window.provider = provider
    console.log('provider has been set: ', provider)
  }

  _updateChainId(ci){
    this.setState({
      chainId: ci
    })
  }

  async _getBalance(){
    const {walletAddress, provider} = this.state
    const balance = await provider.getBalance(walletAddress)
    this.setState({
      balance: balance
    })
  }

  async _updateWalletAddress(wa){

    if(!this.state.walletAddress){
      console.log('this is the first time we have setup the wallet. lets add listeners as well')
      this._initializeMetaMaskChangeHandler()
    }

    this.setState({
      walletAddress: wa
    })

    this._getBalance()
  }

  _initializeMetaMaskChangeHandler(){
    window.ethereum.on('accountsChanged', (accounts) => {
      this._updateWalletAddress(accounts[0])
    })
  }

  render() {
    const { walletAddress, chainId, balance, provider } = this.state
    const ethereum = window.ethereum
    return (
      <Container className='p-5'>
        <Container className='m-2'>
          {window.ethereum ? 'Meta Mask Detected': 'Please Install MetaMask'}
        </Container>
        <Container className='m-2'>
          {walletAddress ? 'Connected To ' + walletAddress :
            <ConnectToWallet walletAddress={walletAddress}
                             updateWallet={this._updateWalletAddress} />}
        </Container>
        <Container className='m-2'>
          {chainId ? "Selected Chain Id: " + ethers.BigNumber.from(chainId).toString() : "No Network"}
        </Container>
        <Container className='m-2'>
          Balance: {balance ? ethers.utils.formatEther(balance) : "N/A"}
        </Container>
        <SendValue provider={provider} getBalance={this._getBalance} />
      </Container>
    );
  }
}

class ConnectToWallet extends React.Component{
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this)
  }

  render(){
    return (
     <Button onClick={this._handleClick}>Connect To Wallet</Button>
    )
  }

  async _handleClick(){
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log(accounts[0])
    this.props.updateWallet(accounts[0])
  }
}

// take where we want to send money
// show how much money they have
// take how much money we want to send
// send it
class SendValue extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      to: '',
      amount: '',
      recipientBalance: ''
    }
  }
  render(){
    const {recipientBalance} = this.state

    return (
      <Container className='m-2'>
        <Form onSubmit={(evt) => evt.preventDefault()}>
          <Form.Group className="mb-3" controlId="to">
            <Form.Label>To</Form.Label>
            <Form.Control type="text"
                          placeholder="Hex Address or ens name"
                          onChange={this._toChanged} />
            <Form.Text className="text-muted">
              This is the recipient to whom you will send value
            </Form.Text>
            <br/>
            {recipientBalance ? "Recipient Balance :" + ethers.utils.formatEther(recipientBalance) : ''}
          </Form.Group>

          <Form.Group className="mb-3" controlId="amount">
            <Form.Label>Amount</Form.Label>
            <Form.Control type="number" placeholder="0.1" step="0.0001"
                          onChange={(evt) =>
                            this.setState({amount: evt.target.value})} />
          </Form.Group>

          <Button variant="primary" type="submit" onClick={this._handleClick}>
            Send Away
          </Button>
        </Form>
      </Container>
    )
  }

  _toChanged = async (evt) => {
    this.setState({to: evt.target.value})
    const {provider} = this.props
    try{
      const recipientBalance = await provider.getBalance(evt.target.value)
      this.setState({recipientBalance})
    }catch(err){
      this.setState({recipientBalance: ''})
      console.error('issue while getting recipient balance: ', err)
    }

  }

  _handleClick = async () => {
    console.log('i have been clicked: ', this)
    const {to, amount} = this.state
    const {provider, getBalance} = this.props
    const signer = await provider.getSigner()
    console.log(signer)
    try{
      const tx = await signer.sendTransaction({to, value: ethers.utils.parseEther(amount)})
      const receipt = await tx.wait()
      console.log(tx, receipt)
      const recipientBalance = await provider.getBalance(to)
      this.setState({recipientBalance})
      getBalance()
    }catch(e){
      console.error('unable to process transaction: ', e)
    }
  }
}

export default App;
