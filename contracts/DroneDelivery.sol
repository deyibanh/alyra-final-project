//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./DroneFlight.sol";
import "./interfaces/IDeliveryManager.sol";
import "./interfaces/IStarwingsMaster.sol";
import { StarwingsDataLib } from "./librairies/StarwingsDataLib.sol";

/**
 * @title The DroneDelivery contract.
 * 
 * @author Starwings
 *
 * @notice This contract iniherits DroneFlight + implement the logic for drones doing deliveries.
 */
contract DroneDelivery is DroneFlight {
    /**
     * @dev The delivery ID.
     */
    string private deliveryId;

    /**
     * @dev The DeliveryManager address.
     */
    address private deliveryManager;

    /**
     * @dev The StarwingsMaster address.
     */
    address private starwingsMaster;

    /**
     * @dev Boolean that show if the parcel has been picked up by the drone.
     */
    bool private droneParcelPickedUp;

    /**
     * @dev Boolean that show if the parcel has been delivered by the drone.
     */
    bool private droneParcelDelivered;

    /**
     * @dev Boolean that show if the delivery is initialized.
     */
    bool private isInit;

    /**
     * @notice Parcel picked up event.
     */
    event ParcelPickedUp();

    /**
     * @notice Parcel delivered event.
     */
    event ParcelDelivered();

    /**
     * @notice The constructor.
     *
     * @param _deliveryManagerAddress The DeliveryManager address.
     * @param _deliveryId The delivery ID.
     * @param _conopsManagerAddress The ConopsManager address.
     * @param _accessControlAddress The IAccessControl address.
     * @param _starwingsMasterAddress The StarwingsMaster address.
     */
    constructor(
        address _deliveryManagerAddress,
        string memory _deliveryId,
        address _conopsManagerAddress,
        address _accessControlAddress,
        address _starwingsMasterAddress
    ) DroneFlight(_conopsManagerAddress, _accessControlAddress) {
        starwingsMaster = _starwingsMasterAddress;
        deliveryManager = _deliveryManagerAddress;
        deliveryId = _deliveryId;
    }

    /**
     * @notice Init the contract with the data of a flight.
     *
     * @param _data The FlightData to store in the contract.
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
     * @notice Return the deliveryId.
     *
     * @return The delivery ID.
     */
    function getDeliveryId() external view returns (string memory) {
        return deliveryId;
    }

    /**
     * @notice Pick up the parcel.
     */
    function pickUp() external onlyRole(StarwingsDataLib.DRONE_ROLE) onlyDrone {
        require(!droneParcelPickedUp, "parcel already pickedUp");

        droneParcelPickedUp = true;
        _allowToFlight();

        emit ParcelPickedUp();
    }

    /**
     * @notice Drop the parcel.
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
     * @notice Return if a parcel has been picked up or not.
     *
     * @return True if the parcel has been picked up.
     */
    function isParcelPickedUp() external view returns (bool) {
        return droneParcelPickedUp;
    }

    /**
     * @notice Return if a parcel has been droped or not.
     *
     * @return True if the parcel has been delivered.
     */
    function isParcelDelivered() external view returns (bool) {
        return droneParcelDelivered;
    }

    /**
     * @notice Return all information in a single function.
     *
     * @return The delivery ID.
     * @return Boolean that show if the parcel has been picked up.
     * @return Boolean that show if the parcel has been delivered.
     * @return Boolean that show if the drone is allowed to flight.
     * @return Flight data.
     * @return The pilot flight state.
     * @return The drone flight state.
     * @return The risk events list.
     * @return The air risks list.
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
     * @inheritdoc DroneFlight
     */
    function _customAllowToFlight() internal view override returns (bool) {
        return droneParcelPickedUp;
    }
}
