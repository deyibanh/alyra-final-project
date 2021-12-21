//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./interfaces/IConopsMaster.sol";

contract DroneFlight {
    // 1. State variables
    IConopsMaster private conopsManager;

    address public piloteAddr;
    address public droneAddr;

    uint256 private conopsId;
    uint256 private flightDatetime;
    uint256 private flightDuration;

    bool private engineCheck;
    bool private batteryCheck;
    bool private controlStationCheck;

    string private pilotName;
    string private droneType;
    string private droneId;
    string private depart;
    string private destination;

    FlightState private flightState;

    // 2. Events
    // 3. Modifiers

    // 4. Structs, arrays, enums
    Event[] private riskEvent;
    Checkpoint[] private checkpoints;
    AirRisk[] private airRisks;

    enum FlightState {
        PreFlight,
        Flying,
        Pause,
        Aborted,
        Ended
    }

    enum RiskType {
        Engine,
        Gps,
        Telecom
    }

    enum AirRiskType {
        Aerodrome,
        Chu
    }

    struct Event {
        uint256 dateTime; // timespan
        RiskType risk;
    }

    struct Coordinate {
        uint256 latitude;
        uint256 longitude;
    }

    struct Checkpoint {
        Coordinate coordo;
        uint256 time;
    }

    struct AirRisk {
        bool validated;
        string name;
        AirRiskType arType;
    }

    // 5. Constructor
    constructor(
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
    ) {
        conopsManager = IConopsMaster(_conopsManager);
        conopsId = _conopsId;
        droneAddr = _drone;
        piloteAddr = _pilot;
        droneType = _droneType;
        droneId = _droneId;
        depart = _depart;
        destination = _destination;
        flightDuration = _flightDuration;
        flightDatetime = _flightDatetime;
    }

    // 6. Fallback — Receive function
    // 7. External visible functions
    // 8. Public visible functions
    // 9. Internal visible functions
    // 10. Private visible functions
}
