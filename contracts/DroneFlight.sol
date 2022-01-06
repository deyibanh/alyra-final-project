//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./interfaces/IConopsManager.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

contract DroneFlight {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    // 1. State variables
    IConopsManager private conopsManager;
    IAccessControl private accessControl;

    bool private engineCheck;
    bool private batteryCheck;
    bool private controlStationCheck;
    bool private allowedToFlight;
    // Drone events
    bool private droneParcelPickUp;
    bool private droneTakeOff;

    StarwingsDataLib.FlightData private datas;
    FlightState private flightState;

    // 2. Events
    // 3. Modifiers
    /**
     * @dev Check the msg.sender's role.
     */
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access refused");
        _;
    }

    // 4. Structs, arrays, enums
    Event[] private riskEvent;
    // Drone checkpoints
    Checkpoint[] private checkpoints;
    StarwingsDataLib.AirRisk[] private airRisks;

    enum FlightState {
        PreFlight,
        Canceled,
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

    // 5. Constructor
    constructor(
        address _conopsManager,
        address _accessControlAddress,
        StarwingsDataLib.FlightData memory data
    ) {
        conopsManager = IConopsManager(_conopsManager);
        accessControl = IAccessControl(_accessControlAddress);
        datas.conopsId = data.conopsId;
        datas.droneAddr = data.droneAddr;
        datas.piloteAddr = data.piloteAddr;
        datas.droneType = data.droneType;
        datas.droneId = data.droneId;
        datas.depart = data.depart;
        datas.destination = data.destination;
        datas.flightDuration = data.flightDuration;
        datas.flightDatetime = data.flightDatetime;
        _setupAirRisk();
    }

    // 6. Fallback — Receive function
    // 7. External visible functions

    function checkEngine()
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        returns (bool)
    {
        require(!engineCheck, "engine already checked");
        engineCheck = true;

        return engineCheck;
    }

    function getEngineCheck() external view returns (bool) {
        return engineCheck;
    }

    function checkBattery()
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        returns (bool)
    {
        require(!batteryCheck, "battery already checked");
        batteryCheck = true;

        return batteryCheck;
    }

    function getBatteryCheck() external view returns (bool) {
        return batteryCheck;
    }

    function checkControlStation()
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        returns (bool)
    {
        require(!controlStationCheck, "station already checked");
        controlStationCheck = true;

        return controlStationCheck;
    }

    function getControlStationCheck() external view returns (bool) {
        return controlStationCheck;
    }

    function newRiskEvent(Event memory _event)
        external
        onlyRole(StarwingsDataLib.DRONE_ROLE)
    {
        riskEvent.push(_event);
    }

    function viewRiskEvent(uint256 _eventId)
        external
        view
        returns (Event memory)
    {
        return riskEvent[_eventId];
    }

    function validateAirRisk(uint256 _airRiskId)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        require(!airRisks[_airRiskId].validated, "airRisk already validated");
        airRisks[_airRiskId].validated = true;
        _allowToFlight();
    }

    function cancelAirRisk(uint256 _airRiskId)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        require(airRisks[_airRiskId].validated, "airRisk already canceled");
        airRisks[_airRiskId].validated = false;
        _allowToFlight();
    }

    function viewAirRisks()
        external
        view
        returns (StarwingsDataLib.AirRisk[] memory)
    {
        return airRisks;
    }

    function cancelFlight() external onlyRole(StarwingsDataLib.PILOT_ROLE) {
        require(flightState == FlightState.PreFlight, "flight already started/canceled");
        _changeFlightState(FlightState(1));
        _allowToFlight();
    }

    function changeFlightStatus(uint256 _status)
        external
        onlyRole(StarwingsDataLib.DRONE_ROLE)
    {
        require(_status != 1, "Drone can't cancel flight");
        require(allowedToFlight, "Flying is not allowed");
        require(
            _status > uint256(FlightState.PreFlight),
            "Not a valide logical status"
        );
        require(
            ((_status == 2 && flightState == FlightState.PreFlight) ||
                (_status > 2 && uint256(flightState) >= 2)),
            "status not allowed"
        );

        _changeFlightState(FlightState(_status));
    }

    function viewFlightstatus() external view returns (FlightState) {
        return flightState;
    }

    // 8. Public visible functions
    // 9. Internal visible functions

    function _setupAirRisk() internal {
        StarwingsDataLib.SimpleConops memory conops = conopsManager.viewConops(
            datas.conopsId
        );
        for (uint256 i = 0; i < conops.airRiskList.length; i++) {
            StarwingsDataLib.AirRisk storage airRisk = airRisks.push();
            airRisk.name = conops.airRiskList[i].name;
            airRisk.riskType = conops.airRiskList[i].riskType;
        }
    }

    function _changeFlightState(FlightState _state) internal {
        flightState = _state;
    }

    function _allowToFlight() internal {
        bool allowed = true;

        if (flightState == FlightState.Canceled) {
            allowed = false;
        } else {
            for (uint256 i = 0; i < airRisks.length; i++) {
                if (!airRisks[i].validated) {
                    allowed = false;
                }
            }
        }

        allowedToFlight = allowed;
    }
    // 10. Private visible functions
}
