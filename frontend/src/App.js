import logo from './logo.svg';
import './App.css';
import React from 'react'
import {Alert, Button, Col, Container, Form, FormControl, InputGroup, Row} from "react-bootstrap";
import {ethers} from 'ethers'
import TokenArtifact from './contracts/Token.json'
import contractAddress from './contracts/contract-address.json'

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
    try {
      const balance = await provider.getBalance(walletAddress)
      this.setState({
        balance: balance
      })
    }catch(err){
      console.warn('error while getting balance: ', err)
      this.setState({
        balance: ''
      })
    }
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
          {chainId && ethers.BigNumber.from(chainId).toString() != '31337' ? <Alert variant='danger'>
            The network you connected to is NOT localhost!!
          </Alert> : ''}
        </Container>
        <Container className='m-2'>
          Balance: {balance ? ethers.utils.formatEther(balance) : "N/A"}
        </Container>
        <SendValue provider={provider} getBalance={this._getBalance} />
        <TokenContract provider={provider} walletAddress={walletAddress} />
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
      console.warn('issue while getting recipient balance: ', err)
      this.setState({recipientBalance: ''})
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

class TokenContract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'unknown',
      symbol: 'unknown',
      tokenCount: 'unknown',
      to: 'unknown',
      tokensToSend: 0,
    }
  }

  componentDidMount() {
    console.log(this.props)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {provider} = this.props
    if(provider){
      if(prevProps.provider != provider){
        const signer = provider.getSigner()
        this.contract = new ethers.Contract(contractAddress.Token, TokenArtifact.abi, signer)
        console.log(this.contract)
      }
    }else{
      this.contract = null
    }

  }

  render(){
    if (!this.contract){
      return null
    }
    const {name, symbol, tokenCount, to, tokensToSend} = this.state


    return (
      <Container className='m-2'>
        TokenContract
        <br/><br/>
        Name: {name} <Button onClick={this._getName} >Get Name</Button>
        <br/><br/>
         Symbol: {symbol} <Button onClick={this._getSymbol} >Get Symbol</Button>
        <br/><br/>
        Token Count: {tokenCount} <Button onClick={this._getTokenCount} >Get Token Count</Button>
        <br/><br/>
        <Form onSubmit={evt => evt.preventDefault() }>
          <Row>
            <Col>
              <Form.Control placeholder="To"
                  onChange={ evt => this.setState({to: evt.target.value})} />
            </Col>
            <Col>
              <Form.Control placeholder="Token Count"
                  onChange={ evt => this.setState({tokensToSend: evt.target.value})} />
            </Col>
            <Col>
              <Button variant="primary" type="submit" onClick={this._handleSendClick}>
                Send Away
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>Clicking this will send {tokensToSend} to {to}. Sure?</p>
            </Col>
          </Row>
        </Form>
      </Container>
    )
  }

  _getName = async () => {
    const name = await this.contract.name()
    this.setState({name})
  }

  _getSymbol = async () => {
    const symbol = await this.contract.symbol()
    this.setState({symbol})
  }

  _getTokenCount = async () => {
    const {walletAddress} = this.props
    console.log(walletAddress)
    const tokenCount = await this.contract.balanceOf(walletAddress)
    console.log(tokenCount.toString())
    this.setState({tokenCount: tokenCount.toString()})
  }

  _handleSendClick = async () => {
    const {to, tokensToSend} = this.state
    this.setState({disableTransferButton: true})
    try{
      console.log(to, tokensToSend)
      const tx = await this.contract.transfer(to, tokensToSend)
      const receipt = await tx.wait()
      await this._getTokenCount()
    }catch(e) {
      console.error('problem while sending: ', e)
    }finally{
      this.setState({disableTransferButton: false})
    }
  }

}

export default App;
