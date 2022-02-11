pragma solidity ^0.7.0;

import "hardhat/console.sol";

contract Token {
    string public name = "My hardhat token";
    string public symbol = "MHT";

    uint256 public totalSupply = 1000;

    address public owner;

    mapping(address => uint256) balances;

    constructor() {
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    function transfer(address to, uint256 amount) external {
        // console.log('i am transferring tokens from: ', msg.sender, ' to: ', to);
        require(balances[msg.sender] >= amount, 'not enough tokens');

        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}