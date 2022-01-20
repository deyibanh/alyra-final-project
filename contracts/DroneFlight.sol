//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./interfaces/IConopsManager.sol";
import { StarwingsDataLib } from "./librairies/StarwingsDataLib.sol";

/**
 * @title The DroneFlight contract.
 * 
 * @author Starwings
 *
 * @notice This abstract contract is the base class for all droneXXX flight.
 */
abstract contract DroneFlight {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    /**
     * @dev The ConopsManager contract.
     */
    IConopsManager private conopsManager;

    /**
     * @dev The IAccessControl contract.
     */
    IAccessControl private accessControl;

    /**
     * @dev A list of Event.
     */
    Event[] internal riskEvent;
    
    /**
     * @dev A list of Checkpoint.
     */
    Checkpoint[] internal checkpoints;

    /**
     * @dev A list of AirRisk.
     */
    StarwingsDataLib.AirRisk[] internal airRisks;

    /**
     * @dev The FlightData.
     */
    StarwingsDataLib.FlightData internal datas;

    /**
     * @dev The drone FlightState.
     */
    FlightState internal droneFlightState;

    /**
     * @dev The pilot FlightState.
     */
    FlightState internal pilotFlightState;

    /**
     * @dev The pre-checks.
     */
    Check internal preChecks;

    /**
     * @dev The post-checks.
     */
    Check internal postChecks;

    /**
     * @dev Boolean that show if the drone is allowed to flight.
     */
    bool internal allowedToFlight;

    /**
     * @notice Preflight check event.
     */
    event PreFlightCheck(CheckType _checkType);

    /**
     * @notice Postflight check event.
     */
    event PostFlightCheck(CheckType _checkType);

    /**
     * @notice AirRisk validated event.
     */
    event AirRiskValidated(uint256 _airRiskId);

    /**
     * @notice AirRisk canceled event.
     */
    event AirRiskCanceled(uint256 _airRiskId);

    /**
     * @notice Cancel flight event.
     */
    event CancelFlight();

    /**
     * @notice Flight status change event.
     */
    event ChangeFlightStatus(FlightState _status);

    /**
     * @notice RiskEvent event.
     */
    event RiskEvent(Event _status);

    /**
     * @notice Checkpoint added event.
     */
    event CheckpointAdded(Checkpoint checkpoint);

    /**
     * @notice Modifier to restrict function to specific role.
     *
     * @dev Use the library to retrieve bytes32 values when calling the modifier.
     *
     * @param _role The role authorize to access the function.
     */
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access Refused");
        _;
    }

    /**
     * @notice Modifier to restrict function to the owner (for flight session it is the pilot).
     */
    modifier onlyOwner() {
        require(datas.pilot.pilotAddress == msg.sender, "Only owner");
        _;
    }

    /**
     * @notice Modifier to restrict function to the owner (for flight session it is the pilot).
     */
    modifier onlyDrone() {
        require(datas.drone.droneAddress == msg.sender, "Only drone");
        _;
    }

    /**
     * @dev FlightState enum.
     *
     * PreFlight : Flight is not started
     * Canceled : Flight canceled (only if in Preflight state)
     * Flying : In flight (only if in Preflight state and allowedToFlight)
     * Paused : In pause/wait (only if in Flying state)
     * Aborted : Flight aborted (only if Flying / Paused)
     * Ended : Flight Ended correctly (only if Flying/Pause)
     */
    enum FlightState {
        PreFlight,
        Canceled,
        Flying,
        Paused,
        Aborted,
        Ended
    }

    /**
     * @dev RiskType enum.
     */
    enum RiskType {
        Engine,
        Gps,
        Telecom
    }

    /**
     * @dev CheckType enum.
     */
    enum CheckType {
        Engine,
        Battery,
        ControlStation
    }

    /**
     * @dev Check struct.
     */
    struct Check {
        mapping(CheckType => bool) checkType;
    }

    /**
     * @dev Event struct.
     */
    struct Event {
        uint256 dateTime; // timespan
        RiskType risk;
    }

    /**
     * @dev Coordinate struct.
     */
    struct Coordinate {
        uint256 latitude;
        uint256 longitude;
    }

    /**
     * @dev Checkpoint struct.
     */
    struct Checkpoint {
        Coordinate coordo;
        uint256 time;
    }

    /**
     * @notice The constructor.
     *
     * @param _conopsManagerAddress The ConopsManager address.
     * @param _accessControlAddress The IAccessControl address.
     */
    constructor(address _conopsManagerAddress, address _accessControlAddress) {
        conopsManager = IConopsManager(_conopsManagerAddress);
        accessControl = IAccessControl(_accessControlAddress);
    }

    /**
     * @notice Do the preflight checks of a certain type.
     *
     * @param _checkType The Checktype to check.
     */
    function preFlightChecks(CheckType _checkType)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        onlyOwner
    {
        require(!preChecks.checkType[_checkType], "already checked");
        preChecks.checkType[_checkType] = true;
        _allowToFlight();

        emit PreFlightCheck(_checkType);
    }

    /**
     * @notice Do the postflight checks of a certain type.
     *
     * @param _checkType The Checktype to check.
     */
    function postFlightChecks(CheckType _checkType)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        onlyOwner
    {
        require(!postChecks.checkType[_checkType], "already checked");
        postChecks.checkType[_checkType] = true;

        emit PostFlightCheck(_checkType);
    }

    /**
     * @notice Return if a specific preflight check has been done.
     *
     * @param _checkType The Checktype to check.
     */
    function getPreFlightChecks(CheckType _checkType)
        external
        view
        returns (bool)
    {
        return preChecks.checkType[_checkType];
    }

    /**
     * @notice Return if a specific postflight check has been done.
     *
     * @param _checkType The Checktype to check.
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
     * @param _time The datetime that the coordinates has been stored.
     * @param _coordinate The coordinates of the checkpoints.
     */
    function addCheckpoint(uint _time, Coordinate memory _coordinate)
        external
        onlyRole(StarwingsDataLib.DRONE_ROLE)
        onlyDrone
    {
        Checkpoint memory checkpoint;
        checkpoint.time = _time;
        checkpoint.coordo = _coordinate;
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
     * @notice Add a new risk event
     * 
     * @param _event The event to be add.
     */
    function newRiskEvent(Event memory _event)
        external
        onlyRole(StarwingsDataLib.DRONE_ROLE)
        onlyDrone
    {
        riskEvent.push(_event);

        emit RiskEvent(_event);
    }

    /**
     * @notice Return the specified risk event.
     *
     * @param _eventId The id of event.
     *
     * @return The risk event.
     */
    function viewRiskEvent(uint256 _eventId)
        external
        view
        returns (Event memory)
    {
        return riskEvent[_eventId];
    }

    /**
     * @notice Validate the air Risk of specified id.
     *
     * @param _airRiskId The id of airRisk.
     */
    function validateAirRisk(uint256 _airRiskId)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        onlyOwner
    {
        require(!airRisks[_airRiskId].validated, "airRisk already validated");
        airRisks[_airRiskId].validated = true;
        _allowToFlight();

        emit AirRiskValidated(_airRiskId);
    }

    /**
     * @notice Cancel the air Risk of specified id.
     * 
     * @param _airRiskId The id of airRisk.
     */
    function cancelAirRisk(uint256 _airRiskId)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        onlyOwner
    {
        require(airRisks[_airRiskId].validated, "airRisk already canceled");
        airRisks[_airRiskId].validated = false;
        _allowToFlight();

        emit AirRiskCanceled(_airRiskId);
    }

    /**
     * @notice Return all air Risk.
     */
    function viewAirRisks()
        external
        view
        returns (StarwingsDataLib.AirRisk[] memory)
    {
        return airRisks;
    }

    /**
     * @notice Cancel the flight.
     * 
     * @dev This function has to be call to cancel the flight.
     * Using changeFlightStatus is not possible.
     */
    function cancelFlight()
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        onlyOwner
    {
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
     * @notice Change the status of the flight.
     *
     * @dev Only Pilot and Drone can call this function.
     * droneFlightState or pilotFlightState will be called depending of the msg.sender.
     *
     * @param _status The uint of the FlightState.
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
     * @notice Return the flight status for the drone.
     *
     * @return The drone flight state.
     */
    function viewDroneFlightstatus() external view returns (FlightState) {
        return droneFlightState;
    }

    /**
     * @notice Return the flight status for the pilot.
     *
     * @return The pilot flight state.
     */
    function viewPilotFlightstatus() external view returns (FlightState) {
        return pilotFlightState;
    }

    /**
     * @notice Setup the data for the flight.
     *
     * @dev Check the StarwingsLibrary to view the struture.
     *
     * @param _data A FlightData structure,
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

    /**
     * @dev Retrieve air AirRisk from the conops and store them.
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
     * @dev Change the droneFlightState.
     *
     * @param _value The new FlightState.
     */
    function _changeDroneFlightState(FlightState _value) internal {
        droneFlightState = _value;
    }

    /**
     * @dev Change the pilotFlightState.
     *
     * @param _value The new FlightState
     */
    function _changePilotFlightState(FlightState _value) internal {
        pilotFlightState = _value;
    }

    /**
     * @dev Call this function if a state change can authorize or not a fly.
     */
    function _allowToFlight() internal {
        bool standardAllowed = _standardAllowToFlight();
        bool customAllowed = _customAllowToFlight();

        allowedToFlight = (standardAllowed && customAllowed);
    }

    /**
     * @dev Internal control to see if flying can start.
     *
     * @return True if the fly can start.
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
     * @dev This function is called by _allowToFlight().
     *      It allow each DroneFlight (DroneDelivery, DroneTaxi, ...) to
     *      have their proper control/authotirzation.
     *
     * @return True if the fly can start.
     */
    function _customAllowToFlight() internal virtual returns (bool);
}
