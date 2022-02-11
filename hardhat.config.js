console.log('in hardhat config file doing INIT ********')
require('dotenv').config();

require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-web3")
require("@nomiclabs/hardhat-etherscan");

task('balance', 'get balance of an account')
    .addParam('address', 'the wallet address you want to get it for')
    .setAction(async ({address}) => {
      console.log('getting balance for ', address)
      bal = await ethers.provider.getBalance(address)
      bal = ethers.utils.formatEther(bal)
      console.log(bal)
    })

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
      compilers: [
          {
              version: "0.8.4",
          },
          {
              version: "0.7.0"
          }
      ]
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      // See its defaults
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/9KvVSlPxlm2m7-xkEQeIc_pYRr_Y-rwp",
      // from: 0x820b6A6a2e26d7C0398B2D436f69EF007c137132, // this is default sender which defaults to first account
      // accounts: 'remote' // accounts used by hardhat
      accounts: [process.env.acc1_private_key, process.env.acc2_private_key]
    }
  },
  etherscan: {
      apiKey: "4GNTDCMXVGECYNSES575CKBTAVFUE2GFXK"
  }
};
