const { ethers, artifacts} = require('hardhat')
const fs = require('fs')

// owner.getBalance()
// ethers.provider.getBalance(owner.address)
// both do the same job

async function main(){

    // if you deploy to hardhat network, then you wont really be able to use it
    // as it gone when this script ends.
    if (network.name === "hardhat") {
      console.warn(
        "You are trying to deploy a contract to the Hardhat Network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }

    const [owner, ...rest] = await ethers.getSigners()
    ownerBalance = await owner.getBalance()
    ownerBalance = ethers.utils.formatEther(ownerBalance)
    console.log('owner balance: ', ownerBalance)

    Token = await ethers.getContractFactory('Token')
    myTokenContract = await Token.connect(owner).deploy()
    await myTokenContract.deployed()

    console.log('deployed contract to: ', myTokenContract.address)

    ownerBalance = await owner.getBalance()
    ownerBalance = ethers.utils.formatEther(ownerBalance)
    console.log('owner balance now is: ', ownerBalance)
    console.log('token contract is here: ', myTokenContract.address)

    // save the deployed contract's address and its abi
    await saveFrontendFiles('Token', myTokenContract.address)
}

const saveFrontendFiles = async (name, address) => {
  console.log('going to save contract: ', name, ' which has been deployed at: ', address)
  const outputDir = __dirname + '/../frontend/src/contracts'
  console.log('output directory is: ', outputDir)
  if (!fs.existsSync(outputDir)){
    console.log('creating directory!')
    fs.mkdirSync(outputDir)
  }else{
    console.log('directory already exists')
  }

  console.log('saving address: ', name, address)
  fs.writeFileSync(outputDir+"/contract-address.json",
    JSON.stringify({
      [name]: address
    }, undefined, 2))

  console.log('saving artifact: ', name)
  const contractArtifact = artifacts.readArtifactSync(name)
  fs.writeFileSync(outputDir+`/${name}.json`,
    JSON.stringify(contractArtifact, undefined, 2))

}

main()
    .then(() => process.exit(0))
    .catch((err) => {console.log('err:', err); process.exit(1)})
