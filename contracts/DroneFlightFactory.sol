//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./DroneDelivery.sol";
import "./interfaces/IStarwingsMaster.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/**
 *   @title DroneFlightFactory
 *   @author Damien
 *  @notice This contract serve as a factory for deploying new DroneFlight contract of different types.
 */
contract DroneFlightFactory {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    IAccessControl private accessControl;
    IStarwingsMaster private starwingsMaster;
    address[] public deployedContracts;

    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access refused");
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

    // modifier isAllowedTypeFlight(FlightType _type) {
    //     require(_type <= type(FlightType).max, "type of flight not allowed");
    //     _;
    // }

    function newDroneDelivery(
        uint256 _deliveryId,
        StarwingsDataLib.FlightData memory flightData
    )
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        returns (address droneDeliveryAddress)
    {
        DroneDelivery droneDelivery = new DroneDelivery(
            starwingsMaster.getDeliveryManager(),
            _deliveryId,
            starwingsMaster.getConopsManager(),
            starwingsMaster.getAccessControlAddress(),
            flightData
        );

        droneDeliveryAddress = address(droneDelivery);
        deployedContracts.push(droneDeliveryAddress);
        starwingsMaster.addDroneFlight(
            droneDeliveryAddress,
            flightData.piloteAddr,
            flightData.droneAddr
        );
    }

    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
}
