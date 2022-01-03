//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./interfaces/IConopsManager.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

contract DroneFlight {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    // 1. State variables
    IConopsManager private conopsManager;

    bool private engineCheck;
    bool private batteryCheck;
    bool private controlStationCheck;
    // Drone events
    bool private droneParcelPickUp;
    bool private droneTakeOff;

    StarwingsDataLib.FlightData private datas;
    FlightState private flightState;

    // 2. Events
    // 3. Modifiers

    // 4. Structs, arrays, enums
    Event[] private riskEvent;
    // Drone checkpoints
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
    constructor(address _conopsManager, StarwingsDataLib.FlightData memory data)
    {
        conopsManager = IConopsManager(_conopsManager);
        datas.conopsId = data.conopsId;
        datas.droneAddr = data.droneAddr;
        datas.piloteAddr = data.piloteAddr;
        datas.droneType = data.droneType;
        datas.droneId = data.droneId;
        datas.depart = data.depart;
        datas.destination = data.destination;
        datas.flightDuration = data.flightDuration;
        datas.flightDatetime = data.flightDatetime;
    }

    // 6. Fallback — Receive function
    // 7. External visible functions
    // 8. Public visible functions
    // 9. Internal visible functions
    // 10. Private visible functions
}
