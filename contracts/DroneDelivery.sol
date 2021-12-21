//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./DroneFlight.sol";

contract DroneDelivery is DroneFlight {
    uint256 private deliveryId;
    address private deliveryManager;

    constructor(
        address _deliveryManager,
        uint256 _deliveryId,
        // DroneFlight
        address _conopsManager,
        uint256 _conopsId,
        address _drone,
        address _pilot,
        string memory _droneType,
        string memory _droneId,
        string memory _depart,
        string memory _destination,
        uint256 _flightDatetime,
        uint256 _flightDuration
    )
        DroneFlight(
            _conopsManager,
            _conopsId,
            _drone,
            _pilot,
            _droneType,
            _droneId,
            _depart,
            _destination,
            _flightDatetime,
            _flightDuration
        )
    {
        deliveryManager = _deliveryManager;
        deliveryId = _deliveryId;
    }

    function getDeliveryId() external view returns (uint256) {
        return deliveryId;
    }
}
