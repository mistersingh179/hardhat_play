const { ethers } = require('hardhat')

// owner.getBalance()
// ethers.provider.getBalance(owner.address)
// both do the same job

async function main(){
    const [owner, ...rest] = await ethers.getSigners()
    ownerBalance = await owner.getBalance()
    ownerBalance = ethers.utils.formatEther(ownerBalance)
    console.log('owner balance: ', ownerBalance)

    Token = await ethers.getContractFactory('Token')
    myTokenContract = await Token.connect(owner).deploy()

    ownerBalance = await owner.getBalance()
    ownerBalance = ethers.utils.formatEther(ownerBalance)
    console.log('owner balance now is: ', ownerBalance)
    console.log('token contract is here: ', myTokenContract.address)
}

main()
    .then(() => process.exit(0))
    .catch((err) => {console.log('err:', err); process.exit(1)})
