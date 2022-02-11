const {expect} = require('chai')
const {ethers} = require("hardhat")

let myContract,
    owner,
    acc1,
    acc2,
    rest = []

describe('Token', () => {
    beforeEach(async function (){
        const Token = await ethers.getContractFactory('Token')
        myContract = await Token.deploy(); // semi needed to make destruct work which is without const/let
        [owner, acc1, acc2, ...rest] = await ethers.getSigners()
    })

    describe('Deployment', () => {
        it('owner has all the tokens upon deployement', async () => {
            const balance = await myContract.balanceOf(owner.address)
            expect(balance).to.equal(1000)
        })
        it('the deployer should be the contract owner', async () => {
            const o = await myContract.owner()
            expect(o).to.equal(owner.address)
        })
    })

    describe('Transactions', () => {
        it('can transfer tokens between accounts', async () => {
            let ownerBalance = await myContract.balanceOf(owner.address)
            let acc2Balance = await myContract.balanceOf(acc2.address)

            expect(acc2Balance).to.equal(0)
            expect(ownerBalance).to.equal(1000)

            const transferTx = await myContract.connect(owner)
                .transfer(acc2.address, 100)

            ownerBalance = await myContract.balanceOf(owner.address)
            acc2Balance = await myContract.balanceOf(acc2.address)

            expect(acc2Balance).to.equal(100)
            expect(ownerBalance).to.equal(900)
        })
        it('transfer fails when not enough balance', async () => {
            await expect(
                 myContract.connect(acc1).transfer(acc2.address, 100)
            ).to.be.reverted
             await expect(
                 myContract.connect(owner).transfer(acc2.address, 100)
            ).to.not.be.reverted

        })
        it('balance is updated after transfers', async() => {
            await myContract.connect(owner).transfer(acc1.address, 100)
            await myContract.connect(acc1).transfer(acc2.address, 25)
            expect(await myContract.balanceOf(acc1.address)).to.equal(75)
        })
    })
})


