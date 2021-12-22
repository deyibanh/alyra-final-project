// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

library StarwingsDataLib {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PILOT_ROLE = keccak256("PILOT_ROLE");
    bytes32 public constant DRONE_ROLE = keccak256("DRONE_ROLE");
    bytes32 public constant EXTERNAL_LEVEL_1 = keccak256("EXTERNAL_LEVEL_1");
    bytes32 public constant EXTERNAL_LEVEL_2 = keccak256("EXTERNAL_LEVEL_2");
    bytes32 public constant EXTERNAL_LEVEL_3 = keccak256("EXTERNAL_LEVEL_3");

    struct FlightData {
        address piloteAddr;
        address droneAddr;
        uint256 conopsId;
        uint256 flightDatetime;
        uint256 flightDuration;
        string pilotName;
        string droneType;
        string droneId;
        string depart;
        string destination;
    }
}
