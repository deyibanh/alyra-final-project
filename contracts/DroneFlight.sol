//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IConopsManager.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";
import "hardhat/console.sol";

abstract contract DroneFlight is Ownable {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    // 1. State variables
    IConopsManager private conopsManager;
    IAccessControl private accessControl;
    bool internal allowedToFlight;
    StarwingsDataLib.FlightData internal datas;
    FlightState internal droneFlightState;
    FlightState internal pilotFlightState;
    Check internal preChecks;
    Check internal postChecks;

    // 2. Events

    event PreFlightCheck(CheckType _checkType);
    event PostFlightCheck(CheckType _checkType);
    event AirRiskValidated(uint256 _airRiskId);
    event AirRiskCanceled(uint256 _airRiskId);
    event CancelFlight();
    event ChangeFlightStatus(FlightState _status);
    event RiskEvent(Event _status);
    event CheckpointAdded(Checkpoint checkpoint);

    // 3. Modifiers
    /**
     *  @notice Modifier to restrict function to specific role
     *  @dev Use the library to retrieve bytes32 values when calling the modifier
     *  @param _role The role authorize to access the function
     */
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access Refused");
        _;
    }

    // 4. Structs, arrays, enums
    Event[] internal riskEvent;
    // Drone checkpoints
    Checkpoint[] internal checkpoints;
    StarwingsDataLib.AirRisk[] internal airRisks;

    /**
     *  PreFlight : flight is not started
     *  Canceled : flight canceled (only if in Preflight state)
     *  Flying : In flight ( only if in Preflight state and allowedToFlight)
     *  Paused : In pause/wait (only if in Flying state)
     *  Aborted : Flight aborted (only if Flying / Paused)
     *  Ended : Flight Ended correctly (only if Flying/Pause)
     */
    enum FlightState {
        PreFlight,
        Canceled,
        Flying,
        Paused,
        Aborted,
        Ended
    }

    enum RiskType {
        Engine,
        Gps,
        Telecom
    }

    enum CheckType {
        Engine,
        Battery,
        ControlStation
    }

    struct Check {
        mapping(CheckType => bool) checkType;
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
    constructor(address _conopsManager, address _accessControlAddress)
    //StarwingsDataLib.FlightData memory data
    {
        conopsManager = IConopsManager(_conopsManager);
        accessControl = IAccessControl(_accessControlAddress);
    }

    /**
     *  @notice Setup the data for the flight
     *  @dev Check the StarwingsLibrary to view the struture
     *  @param _data A FlightData structure,
     */
    function setFlightData(StarwingsDataLib.FlightData memory _data) internal {
        datas.pilot = _data.pilot;
        datas.drone = _data.drone;
        datas.conopsId = _data.conopsId;

        datas.depart = _data.depart;
        datas.destination = _data.destination;
        datas.flightDuration = _data.flightDuration;
        datas.flightDatetime = _data.flightDatetime;
        _setupAirRisk();
    }

    // 6. Fallback — Receive function
    // 7. External visible functions
    /**
     *  @notice Do the preflight checks of a certain type
     *  @param _checkType The Checktype to check
     */
    function preFlightChecks(CheckType _checkType)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        require(!preChecks.checkType[_checkType], "already checked");
        preChecks.checkType[_checkType] = true;
        _allowToFlight();

        emit PreFlightCheck(_checkType);
    }

    /**
     *  @notice Do the postflight checks of a certain type
     *  @param _checkType The Checktype to check
     */
    function postFlightChecks(CheckType _checkType)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        require(!postChecks.checkType[_checkType], "already checked");
        postChecks.checkType[_checkType] = true;

        emit PostFlightCheck(_checkType);
    }

    /**
     *  @notice Return if a specific preflight check has been done
     *  @param _checkType The Checktype to check
     */
    function getPreFlightChecks(CheckType _checkType)
        external
        view
        returns (bool)
    {
        return preChecks.checkType[_checkType];
    }

    /**
     *  @notice Return if a specific postflight check has been done
     *  @param _checkType The Checktype to check
     */
    function getPostFlightChecks(CheckType _checkType)
        external
        view
        returns (bool)
    {
        return postChecks.checkType[_checkType];
    }

    /**
     * @notice Add checkpoint.
     *
     * @param _coordinate The coordinates of the checkpoints.
     */
    function addCheckpoint(Coordinate memory _coordinate) external onlyRole(StarwingsDataLib.DRONE_ROLE) {
        Checkpoint memory checkpoint;
        checkpoint.coordo = _coordinate;
        checkpoint.time = block.timestamp;
        checkpoints.push(checkpoint);

        emit CheckpointAdded(checkpoint);
    }

    /**
     * @notice Get checkpoints.
     *
     * @return All checkpoints.
     */
    function getCheckpoints() external view returns (Checkpoint[] memory) {
        return checkpoints;
    }

    /**
     *  @notice Add a new risk event
     *  @param _event The event to be add
     */
    function newRiskEvent(Event memory _event)
        external
        onlyRole(StarwingsDataLib.DRONE_ROLE)
    {
        riskEvent.push(_event);

        emit RiskEvent(_event);
    }

    /**
     *  @notice Return the specified risk event
     *  @param _eventId The id of event
     */
    function viewRiskEvent(uint256 _eventId)
        external
        view
        returns (Event memory)
    {
        return riskEvent[_eventId];
    }

    /**
     *  @notice Validate the air Risk of specified id
     *  @param _airRiskId The id of airRisk
     */
    function validateAirRisk(uint256 _airRiskId)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        require(!airRisks[_airRiskId].validated, "airRisk already validated");
        airRisks[_airRiskId].validated = true;
        _allowToFlight();

        emit AirRiskValidated(_airRiskId);
    }

    /**
     *  @notice Cancel the air Risk of specified id
     *  @param _airRiskId The id of airRisk
     */
    function cancelAirRisk(uint256 _airRiskId)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        require(airRisks[_airRiskId].validated, "airRisk already canceled");
        airRisks[_airRiskId].validated = false;
        _allowToFlight();

        emit AirRiskCanceled(_airRiskId);
    }

    /**
     *  @notice Return all air Risk
     */
    function viewAirRisks()
        external
        view
        returns (StarwingsDataLib.AirRisk[] memory)
    {
        return airRisks;
    }

    /**
     *  @notice Cancel the flight
     *  @dev This function has to be call to cancel the flight.
     *  Using changeFlightStatus is not possible
     */
    function cancelFlight() external onlyRole(StarwingsDataLib.PILOT_ROLE) {
        require(
            pilotFlightState == FlightState.PreFlight,
            "flight already started/canceled"
        );

        _changeDroneFlightState(FlightState(1));
        _changePilotFlightState(FlightState(1));
        _allowToFlight();

        emit CancelFlight();
    }

    /**
     *  @notice Change the status of the flight
     *  @dev Only Pilot and Drone can call this function
     *       droneFlightState or pilotFlightState will be
     *       called depending of the msg.sender
     *  @param _status The uint of the FlightState
     */
    function changeFlightStatus(uint256 _status) external {
        bool isPilot = accessControl.hasRole(
            StarwingsDataLib.PILOT_ROLE,
            msg.sender
        );
        bool isDrone = accessControl.hasRole(
            StarwingsDataLib.DRONE_ROLE,
            msg.sender
        );

        require(isPilot || isDrone, "Access refused");
        require(_status != 1, "Cannot cancel flight this way");
        require(
            _status > uint256(FlightState.PreFlight),
            "Not a valide logical status"
        );
        require(
            _status <= uint256(type(FlightState).max),
            "Not a valide logical status"
        );
        require(allowedToFlight, "Flying is not allowed");

        FlightState statetype;
        if (isDrone) {
            statetype = droneFlightState;
        } else {
            statetype = pilotFlightState;
        }

        require(
            ((_status == 2 && statetype == FlightState.PreFlight) ||
                (_status > 2 && uint256(statetype) >= 2)),
            "status not allowed"
        );

        if (isDrone) {
            _changeDroneFlightState(FlightState(_status));
        } else {
            _changePilotFlightState(FlightState(_status));
        }

        emit ChangeFlightStatus(FlightState(_status));
    }

    /**
     *  @notice Return the flight status for the drone
     */
    function viewDroneFlightstatus() external view returns (FlightState) {
        return droneFlightState;
    }

    /**
     *  @notice Return the flight status for the pilot
     */
    function viewPilotFlightstatus() external view returns (FlightState) {
        return pilotFlightState;
    }

    // 8. Public visible functions
    // 9. Internal visible functions

    /**
     *  @dev Retrieve air AirRisk from the conops and store them
     */
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

    /**
     *  @dev Change the droneFlightState
     *  @param _value The new FlightState
     */
    function _changeDroneFlightState(FlightState _value) internal {
        droneFlightState = _value;
    }

    /**
     *  @dev Change the pilotFlightState
     *  @param _value The new FlightState
     */
    function _changePilotFlightState(FlightState _value) internal {
        pilotFlightState = _value;
    }

    /**
     *  @dev call this function if a state change can authorize or not a fly
     */
    function _allowToFlight() internal {
        bool standardAllowed = _standardAllowToFlight();
        bool customAllowed = _customAllowToFlight();

        allowedToFlight = (standardAllowed && customAllowed);
    }

    /**
     *  @dev internal control to see if flying can start
     */
    function _standardAllowToFlight() internal view returns (bool) {
        bool allowed = true;

        allowed =
            preChecks.checkType[CheckType(0)] &&
            preChecks.checkType[CheckType(1)] &&
            preChecks.checkType[CheckType(2)];

        if (pilotFlightState == FlightState.Canceled) {
            allowed = false;
        } else {
            for (uint256 i = 0; i < airRisks.length; i++) {
                if (!airRisks[i].validated) {
                    allowed = false;
                }
            }
        }

        return allowed;
    }

    /**
     *  @dev this function is called by _allowToFlight()
     *  It allow each DroneFlight (DroneDelivery, DroneTaxi, ...) to
     *  have their proper control/authotirzation
     */
    function _customAllowToFlight() internal virtual returns (bool);
}
