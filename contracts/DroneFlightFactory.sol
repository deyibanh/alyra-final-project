//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./DroneDelivery.sol";
import "./interfaces/IStarwingsMaster.sol";
import "./interfaces/IDeliveryManager.sol";
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

    function newDroneDelivery(
        string memory _deliveryId,
        address _drone,
        uint256 _conopsId,
        uint256 _flightDatetime,
        uint256 _flightDuration,
        string memory _depart,
        string memory _destination
    ) external onlyRole(StarwingsDataLib.PILOT_ROLE) returns (address droneDeliveryAddress) {
        StarwingsDataLib.Pilot memory pilot = starwingsMaster.getPilot(
            msg.sender
        );
        StarwingsDataLib.Drone memory drone = starwingsMaster.getDrone(_drone);

        StarwingsDataLib.FlightData memory flightData = StarwingsDataLib.FlightData(
            pilot,
            drone,
            _conopsId,
            _flightDatetime,
            _flightDuration,
            _depart,
            _destination
        );

        droneDeliveryAddress = _newDroneDelivery(_deliveryId, flightData);
    }

    function _newDroneDelivery(
        string memory _deliveryId,
        StarwingsDataLib.FlightData memory flightData
    )
        internal
        returns (address droneDeliveryAddress)
    {
        IDeliveryManager deliveryManager = IDeliveryManager(starwingsMaster.getDeliveryManager());

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
            flightData.pilot.pilotAddress,
            flightData.drone.droneAddress
        );

        deliveryManager.setDeliveryState(_deliveryId, IDeliveryManager.DeliveryState(3));
    }

    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
}
