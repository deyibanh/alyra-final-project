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
        address _accessControlAddress,
        StarwingsDataLib.FlightData memory data
    ) DroneFlight(_conopsManager, _accessControlAddress, data) {

        deliveryManager = _deliveryManager;
        deliveryId = _deliveryId;
    }

    function getDeliveryId() external view returns (uint256) {
        return deliveryId;
    }
}
