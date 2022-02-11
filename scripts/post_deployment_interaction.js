async function main() {
    const Token = await ethers.getContractFactory('Token')
    const myDeployedContract = await Token.attach('0x0B11b582E0580c9812d882283045703CF8D92491')
    console.log(await myDeployedContract.name())
    console.log(await myDeployedContract.symbol())
    console.log(await myDeployedContract.balanceOf('0x820b6A6a2e26d7C0398B2D436f69EF007c137132'))
}

main().then(
    () => process.exit(0)
).catch(
    err => {
        console.log(err)
        process.exit(1)
    }
)