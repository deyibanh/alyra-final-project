// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/**
 * @title The StarwingsDataLib library.
 *
 * @author Starwings
 *
 * @notice This is the StarwingsDataLib library.
 */
library StarwingsDataLib {
    /**
     * @dev The Admin role constant.
     */
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /**
     * @dev The Pilot role constant.
     */
    bytes32 public constant PILOT_ROLE = keccak256("PILOT_ROLE");

    /**
     * @dev The Drone role constant.
     */
    bytes32 public constant DRONE_ROLE = keccak256("DRONE_ROLE");

    /**
     * @dev The external level 1 constant.
     */
    bytes32 public constant EXTERNAL_LEVEL_1 = keccak256("EXTERNAL_LEVEL_1");

    /**
     * @dev The external level 2 constant.
     */
    bytes32 public constant EXTERNAL_LEVEL_2 = keccak256("EXTERNAL_LEVEL_2");

    /**
     * @dev The external level 3 constant.
     */
    bytes32 public constant EXTERNAL_LEVEL_3 = keccak256("EXTERNAL_LEVEL_3");

    /**
     * @dev Pilot struct.
     */
    struct Pilot {
        uint256 index;
        bool isDeleted;
        string name;
        address pilotAddress;
        address[] flightAddresses;
    }

    /**
     * @dev Drone struct.
     */
    struct Drone {
        uint256 index;
        bool isDeleted;
        string droneId;
        string droneType;
        address droneAddress;
        address[] flightAddresses;
    }

    /**
     * @dev FlightData struct.
     */
    struct FlightData {
        Pilot pilot;
        Drone drone;
        uint256 conopsId;
        uint256 flightDatetime;
        uint256 flightDuration;
        string depart;
        string destination;
    }

    /**
     * @dev AirRisk struct.
     */
    struct AirRisk {
        bool validated;
        string name;
        AirRiskType riskType;
    }

    /**
     * @dev SimpleConops struct.
     */
    struct SimpleConops {
        bool activated;
        string name;
        string startingPoint;
        string endPoint;
        string crossRoad;
        string exclusionZone;
        uint8 grc;
        uint8 arc;
        AirRisk[] airRiskList;
    }

    /**
     * @dev AirRiskType enum.
     */
    enum AirRiskType {
        Aerodrome,
        CHU,
        MilitaryBase
    }
}
