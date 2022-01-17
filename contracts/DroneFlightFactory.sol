//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./interfaces/IStarwingsMaster.sol";
import "./interfaces/IDeliveryManager.sol";
import "./interfaces/IDroneFlight.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/**
 *  @title DroneFlightFactory
 *  @author Damien
 *  @notice This contract serve as a factory for deploying new DroneFlight contract of different types.
 */
contract DroneFlightFactory {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    IAccessControl private accessControl;
    IStarwingsMaster private starwingsMaster;

    address[] public deployedContracts;
    event Deployed(address addr, uint256 salt);

    /**
     *  @notice Modifier to restrict function to specific role
     *  @dev Use the library to retrieve bytes32 values when calling the modifier
     *  @param _role The role authorize to access the function
     */
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access Refused");
        _;
    }

    enum FlightType {
        delivery,
        photo,
        taxi
    }

    constructor(address accessControlAddress, address starwingsMasterAddress) {
        accessControl = IAccessControl(accessControlAddress);
        starwingsMaster = IStarwingsMaster(starwingsMasterAddress);
    }

    /**
     *  @notice Deploy a new instance of the contract's bytecode
     *  @param code The byte code of the contract to deploy
     *  @param salt Salt
     */
    function deploy(bytes memory code, uint256 salt)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        address addr;
        assembly {
            addr := create2(0, add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        deployedContracts.push(addr);

        emit Deployed(addr, salt);
    }

    /**
     *  @notice Return all deployed contrats addresses
     */
    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
}
