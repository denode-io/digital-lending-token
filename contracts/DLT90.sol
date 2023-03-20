// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


contract DLT90 is ERC20, AccessControl, ERC20Burnable {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private immutable _maxSupply = 1_000_000_000;

    constructor() ERC20("Digital Lending Token 90", "DLT90") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function decimals() public pure override returns (uint8) {
		return 0;
	}

    function maxSupply() public view virtual returns (uint256) {
        return _maxSupply;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(ERC20.totalSupply() + amount <= maxSupply(), "Supply limit exceeded");
        _mint(to, amount);
    }

}