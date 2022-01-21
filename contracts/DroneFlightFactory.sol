//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./interfaces/IStarwingsMaster.sol";
import "./interfaces/IDeliveryManager.sol";
import { StarwingsDataLib } from "./librairies/StarwingsDataLib.sol";

/**
 * @title The DroneFlightFactory contract.
 *
 * @author Starwings
 *
 * @notice This contract serve as a factory for deploying new DroneFlight contract of different types.
 */
contract DroneFlightFactory {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    /**
     * @dev The IAccessControl contract.
     */
    IAccessControl private accessControl;

    /**
     * @dev The IAccessControl contract.
     */
    IStarwingsMaster private starwingsMaster;

    /**
     * @dev A list of deployed contracts address.
     */
    address[] public deployedContracts;

    /**
     * @notice Deployed event.
     *
     * @param addr The contract address.
     * @param salt The salt.
     */
    event Deployed(address addr, uint256 salt);

    /**
     * @notice Modifier to restrict function to specific role.
     *
     * @dev Use the library to retrieve bytes32 values when calling the modifier.
     *
     * @param _role The role authorize to access the function.
     */
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access Refused");
        _;
    }

    /**
     * @dev FlightType enum.
     */
    enum FlightType {
        delivery,
        photo,
        taxi
    }

    /**
     * @notice The constructor.
     *
     * @param _accessControlAddress The IAccessControl address.
     * @param _starwingsMasterAddress The StarwingsManager address.
     */
    constructor(address _accessControlAddress, address _starwingsMasterAddress) {
        accessControl = IAccessControl(_accessControlAddress);
        starwingsMaster = IStarwingsMaster(_starwingsMasterAddress);
    }

    /**
     * @notice Deploy a new instance of the contract's bytecode.
     *
     * @param code The byte code of the contract to deploy.
     * @param salt The salt.
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
     * @notice Return all deployed contrats addresses.
     */
    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
}
