//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/** 
    @title Starwings Acces Control Manager
    @author Damien
    @notice This contract manage all the access.
 */
contract SWAccessControl is AccessControl {
    // Create a new role identifier for the minter role
    // bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    // bytes32 public constant PILOT_ROLE = keccak256("PILOT_ROLE");
    // bytes32 public constant DRONE_ROLE = keccak256("DRONE_ROLE");
    // bytes32 public constant EXTERNAL_LEVEL_1 = keccak256("EXTERNAL_LEVEL_1");
    // bytes32 public constant EXTERNAL_LEVEL_2 = keccak256("EXTERNAL_LEVEL_2");
    // bytes32 public constant EXTERNAL_LEVEL_3 = keccak256("EXTERNAL_LEVEL_3");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setRoleAdmin(bytes32 role, bytes32 adminRole)
        external
        onlyRole(getRoleAdmin(role))
    {
        _setRoleAdmin(role, adminRole);
    }
}
