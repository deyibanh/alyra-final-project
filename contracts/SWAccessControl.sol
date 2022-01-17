//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/** 
 *  @title Starwings Acces Control Manager
 *  @author Damien
 *  @notice This contract manage all the access.
 */
contract SWAccessControl is AccessControl {
    bytes32 public ADMIN_ROLE = StarwingsDataLib.ADMIN_ROLE;
    bytes32 public PILOT_ROLE = StarwingsDataLib.PILOT_ROLE;
    bytes32 public DRONE_ROLE = StarwingsDataLib.DRONE_ROLE;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /**
     *  @notice set a role as an admin for a specific role
     *  @param _role Role that will have a new admin
     *  @param _adminRole Role that will be the new admin of role _role
     */
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole)
        external
        onlyRole(getRoleAdmin(_role))
    {
        _setRoleAdmin(_role, _adminRole);
    }
}
