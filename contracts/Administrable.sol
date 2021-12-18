//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Administrable is Ownable{
    /** 
        @notice return True if address is an admin
     */
    mapping(address => bool) public admin;

    modifier onlyAdmins() {
        require(owner() == _msgSender() || admin[msg.sender], "not admin or owner");
        _;
    }

    function setAdmin(address _newAdmin) public onlyOwner {
        require (admin[_newAdmin] == false);
        admin[_newAdmin] = true;
    }

    function removeAdmin(address _newAdmin) public onlyOwner {
        require (admin[_newAdmin] == true);
        admin[_newAdmin] = false;
    }
}