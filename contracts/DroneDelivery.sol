//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./DroneFlight.sol";

contract DroneDelivery is DroneFlight {
    string private deliveryId;
    address private deliveryManager;
    bool private droneParcelPickedUp;
    bool private droneParcelDelivered;

    event ParcelPickedUp();
    event ParcelDelivered();

    constructor(
        address _deliveryManager,
        string memory _deliveryId,
        // DroneFlight
        address _conopsManager,
        address _accessControlAddress,
        StarwingsDataLib.FlightData memory data
    ) DroneFlight(_conopsManager, _accessControlAddress, data) {
        deliveryManager = _deliveryManager;
        deliveryId = _deliveryId;
    }

    function getDeliveryId() external view returns (string memory) {
        return deliveryId;
    }

    function pickUp() external onlyRole(StarwingsDataLib.DRONE_ROLE) {
        require(!droneParcelPickedUp, "parcel already pickedUp");
        droneParcelPickedUp = true;
        _allowToFlight();

        emit ParcelPickedUp();
    }

    function deliver() external onlyRole(StarwingsDataLib.DRONE_ROLE) {
        require(droneParcelPickedUp, "parcel not picked up before");
        droneParcelDelivered = true;

        emit ParcelDelivered();
    }

    function isParcelPickedUp() external view returns (bool) {
        return droneParcelPickedUp;
    }

    function isParcelDelivered() external view returns (bool) {
        return droneParcelDelivered;
    }

    function _customAllowToFlight() internal view override returns (bool) {
        return droneParcelPickedUp;
    }

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
            droneFlightState,  
            pilotFlightState,
            riskEvent,
            airRisks
        );
    }
}
