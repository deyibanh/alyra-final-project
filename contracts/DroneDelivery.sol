//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./DroneFlight.sol";
import "./interfaces/IStarwingsMaster.sol";
import "./interfaces/IDeliveryManager.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/**
 *  @title DroneDelivery
 *  @author Starwings
 *  @notice This contract iniherits DroneFlight + implement the logic for drones doing deliveries
 */
contract DroneDelivery is DroneFlight {
    string private deliveryId;
    address private deliveryManager;
    address private starwingsMaster;
    bool private droneParcelPickedUp;
    bool private droneParcelDelivered;
    bool private isInit;

    event ParcelPickedUp();
    event ParcelDelivered();

    constructor(
        address _deliveryManager,
        string memory _deliveryId,
        address _conopsManager,
        address _accessControlAddress,
        address _starwingsMaster
    ) DroneFlight(_conopsManager, _accessControlAddress) {
        starwingsMaster = _starwingsMaster;
        deliveryManager = _deliveryManager;
        deliveryId = _deliveryId;
    }

    /**
     *  @notice Init the contract with the data of a flight
     *  @param _data The FlightData to store in the contract
     */
    function initDelivery(StarwingsDataLib.FlightData memory _data)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        require(!isInit, "flight already init");
        require(_data.pilot.pilotAddress == msg.sender, "Init for self only");
        setFlightData(_data);
        isInit = true;
        IStarwingsMaster(starwingsMaster).addDroneFlight(
            address(this),
            _data.pilot.pilotAddress,
            _data.drone.droneAddress
        );

        IDeliveryManager(deliveryManager).setDeliveryState(
            deliveryId,
            IDeliveryManager.DeliveryState(3)
        );
    }

    /**
     *  @notice Return the deliveryId
     */
    function getDeliveryId() external view returns (string memory) {
        return deliveryId;
    }

    /**
     *  @notice Grab the parcel
     */
    function pickUp() external onlyRole(StarwingsDataLib.DRONE_ROLE) onlyDrone {
        require(!droneParcelPickedUp, "parcel already pickedUp");
        droneParcelPickedUp = true;
        _allowToFlight();

        emit ParcelPickedUp();
    }

    /**
     *  @notice Drop the parcel
     */
    function deliver()
        external
        onlyRole(StarwingsDataLib.DRONE_ROLE)
        onlyDrone
    {
        require(droneParcelPickedUp, "parcel not picked up before");
        droneParcelDelivered = true;

        emit ParcelDelivered();
    }

    /**
     *  @notice Return if a parcel has been grabed or not
     */
    function isParcelPickedUp() external view returns (bool) {
        return droneParcelPickedUp;
    }

    /**
     *  @notice Return if a parcel has been droped or not
     */
    function isParcelDelivered() external view returns (bool) {
        return droneParcelDelivered;
    }

    /**
     *  @notice Return all information in a single function
     */
    function flightInfoDisplay()
        external
        view
        returns (
            string memory,
            bool,
            bool,
            bool,
            StarwingsDataLib.FlightData memory,
            FlightState,
            FlightState,
            Event[] memory,
            StarwingsDataLib.AirRisk[] memory
        )
    {
        return (
            deliveryId,
            droneParcelPickedUp,
            droneParcelDelivered,
            allowedToFlight,
            datas,
            pilotFlightState,
            droneFlightState,
            riskEvent,
            airRisks
        );
    }

    /**
     *  @dev the proper control of the contract to check if a flight can start
     */
    function _customAllowToFlight() internal view override returns (bool) {
        return droneParcelPickedUp;
    }
}
