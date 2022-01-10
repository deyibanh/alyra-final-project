// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./interfaces/IConopsManager.sol";
import "./interfaces/IDeliveryManager.sol";
import "./interfaces/IStarwingsMaster.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/**
 * @title The StarwingsMaster contract.
 *
 * @author Dé Yi Banh (@deyibanh)
 *
 * @notice This contract manages drone flights creation from CONOPS.
 */
contract StarwingsMaster is IStarwingsMaster {
    using StarwingsDataLib for StarwingsDataLib.Pilot;
    using StarwingsDataLib for StarwingsDataLib.Drone;

    /**
     * @dev The DroneFlightFactory address.
     */
    address private droneFlightFactoryAddress;

    /**
     * @dev A list of DroneFlight address.
     */
    address[] private droneFlightAddressList;

    /**
     * @dev A list of Pilot.
     */
    StarwingsDataLib.Pilot[] private pilotList;

    /**
     * @dev A list of Drone.
     */
    StarwingsDataLib.Drone[] private droneList;

    /**
     * @dev A map of a pilot address and an index of the pilot list.
     */
    mapping(address => uint256) private pilotIndexMap;

    /**
     * @dev A map of a drone address and an index of the drone list.
     */
    mapping(address => uint256) private droneIndexMap;

    /**
     * @dev The IAccessControl contract.
     */
    IAccessControl private accessControl;

    /**
     * @dev The ConopsManager contract.
     */
    IConopsManager private conopsManager;

    /**
     * @dev The DeliveryManager contract.
     */
    IDeliveryManager private deliveryManager;

    /**
     * @notice Pilot added event.
     *
     * @param pilotAddress The pilot address.
     */
    event PilotAdded(address pilotAddress);

    /**
     * @notice Pilot deleted event.
     *
     * @param pilotAddress The pilot address.
     */
    event PilotDeleted(address pilotAddress);

    /**
     * @notice Drone added event.
     *
     * @param droneAddress The drone address.
     */
    event DroneAdded(address droneAddress);

    /**
     * @notice Drone deleted event.
     *
     * @param droneAddress The drone address.
     */
    event DroneDeleted(address droneAddress);

    /**
     * @dev Check the msg.sender's role.
     */
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access refused");
        _;
    }

    /**
     * @notice The constructor.
     *
     * @param _accessControlAddress The IAccessControl address.
     * @param _conopsManagerAddress The ConopsManager address.
     * @param _deliveryManagerAddress The DeliveryManager address.
     */
    constructor(
        address _accessControlAddress,
        address _conopsManagerAddress,
        address _deliveryManagerAddress
    ) {
        accessControl = IAccessControl(_accessControlAddress);
        conopsManager = IConopsManager(_conopsManagerAddress);
        deliveryManager = IDeliveryManager(_deliveryManagerAddress);
    }

    /**
     * @notice Get the DroneFlightFactory address.
     *
     * @return The DroneFlightFactory address.
     */
    function getDroneFlightFactoryAddress()
        external
        view
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (address)
    {
        return droneFlightFactoryAddress;
    }

    /**
     * @notice Set the DroneFlightFactory address.
     *
     * @param _droneFlightFactoryAddress The DroneFlightFactory address to set.
     */
    function setDroneFlightFactoryAddress(address _droneFlightFactoryAddress)
        external
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
    {
        droneFlightFactoryAddress = _droneFlightFactoryAddress;
    }

    /**
     * @notice Get a list of DroneFlight address.
     *
     * @return A list of DroneFlight address.
     */
    function getDroneFlightAddressList()
        external
        view
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (address[] memory)
    {
        return droneFlightAddressList;
    }

    /**
     * @notice Get the DroneFlight address from id.
     *
     * @param _droneFlightId The DroneFlight id.
     *
     * @return The DroneFlight address.
     */
    function getDroneFlightAddress(uint256 _droneFlightId)
        external
        view
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (address)
    {
        return droneFlightAddressList[_droneFlightId];
    }

    /**
     * @notice Get a list of Pilot.
     *
     * @return A list of Pilot.
     */
    function getPilotList()
        external
        view
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (StarwingsDataLib.Pilot[] memory)
    {
        return pilotList;
    }

    /**
     * @notice Get the pilot information for a given address.
     *
     * @param _pilotAddress The pilot address.
     *
     * @return The pilot information.
     */
    function getPilot(address _pilotAddress)
        external
        view
        returns (StarwingsDataLib.Pilot memory)
    {
        require(
            msg.sender == droneFlightFactoryAddress ||
                accessControl.hasRole(StarwingsDataLib.ADMIN_ROLE, msg.sender),
            "Access refused"
        );
        uint256 pilotIndex = pilotIndexMap[_pilotAddress];
        require(pilotIndex < pilotList.length, "Out of size index.");
        require(
            pilotList[pilotIndex].pilotAddress != address(0) &&
                pilotList[pilotIndex].pilotAddress == _pilotAddress,
            "Pilot not found."
        );

        return pilotList[pilotIndex];
    }

    /**
     * @notice Add a pilot for a given address.
     *
     * @dev The pilot can be added only if he is not registered yet or if he have been deleted.
     *
     * @param _pilotAddress The pilot address.
     * @param _pilotName The pilot name.
     */
    function addPilot(address _pilotAddress, string memory _pilotName)
        external
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
    {
        require(_pilotAddress != address(0), "Can not add this address.");

        StarwingsDataLib.Pilot memory pilot;
        uint256 pilotIndex = pilotIndexMap[_pilotAddress];

        if (
            pilotList.length > pilotIndex &&
            pilotList[pilotIndex].pilotAddress == _pilotAddress
        ) {
            pilot = pilotList[pilotIndex];
        }

        require(
            (pilotIndex == 0 && pilot.pilotAddress == address(0)) ||
                pilot.isDeleted,
            "Pilot already added."
        );

        pilot.isDeleted = false;
        pilot.name = _pilotName;

        if (pilotIndex == 0 && pilot.pilotAddress == address(0)) {
            pilot.pilotAddress = _pilotAddress;
            pilotList.push(pilot);
            uint256 newPilotIndex = pilotList.length - 1;
            pilotList[newPilotIndex].index = newPilotIndex;
            pilotIndexMap[_pilotAddress] = newPilotIndex;
        } else {
            pilotList[pilotIndex] = pilot;
        }

        emit PilotAdded(_pilotAddress);
    }

    /**
     * @notice Delete a pilot for a given address.
     *
     * @param _pilotAddress The pilot address.
     */
    function deletePilot(address _pilotAddress)
        external
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
    {
        uint256 pilotIndex = pilotIndexMap[_pilotAddress];
        require(pilotIndex < pilotList.length, "Out of size index.");
        require(
            pilotList[pilotIndex].pilotAddress != address(0) &&
                pilotList[pilotIndex].pilotAddress == _pilotAddress,
            "Pilot not found."
        );

        pilotList[pilotIndex].isDeleted = true;

        emit PilotDeleted(_pilotAddress);
    }

    /**
     * @notice Get the index of a pilot from a pilot address.
     *
     * @param _pilotAddress The pilot address.
     *
     * @return The index of a pilot.
     */
    function getPilotIndex(address _pilotAddress)
        external
        view
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (uint256)
    {
        return pilotIndexMap[_pilotAddress];
    }

    /**
     * @notice Get a list of Drone.
     *
     * @return A list of Drone.
     */
    function getDroneList()
        external
        view
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (StarwingsDataLib.Drone[] memory)
    {
        return droneList;
    }

    /**
     * @notice Get the drone information for a given address.
     *
     * @param _droneAddress The drone address.
     *
     * @return The drone information.
     */
    function getDrone(address _droneAddress)
        external
        view
        returns (StarwingsDataLib.Drone memory)
    {
        require(
            msg.sender == droneFlightFactoryAddress ||
                accessControl.hasRole(StarwingsDataLib.ADMIN_ROLE, msg.sender),
            "Access refused"
        );
        uint256 droneIndex = droneIndexMap[_droneAddress];
        require(droneIndex < droneList.length, "Out of size index.");
        require(
            droneList[droneIndex].droneAddress != address(0) &&
                droneList[droneIndex].droneAddress == _droneAddress,
            "Drone not found."
        );

        return droneList[droneIndex];
    }

    /**
     * @notice Add a drone for a given address.
     *
     * @dev The drone can be added only if he is not registered yet or if he have been deleted.
     *
     * @param _droneAddress The drone address.
     * @param _droneId The drone id.
     * @param _droneType The drone type.
     */
    function addDrone(
        address _droneAddress,
        string memory _droneId,
        string memory _droneType
    ) external onlyRole(StarwingsDataLib.ADMIN_ROLE) {
        require(_droneAddress != address(0), "Can not add this address.");

        StarwingsDataLib.Drone memory drone;
        uint256 droneIndex = droneIndexMap[_droneAddress];

        if (
            droneList.length > droneIndex &&
            droneList[droneIndex].droneAddress == _droneAddress
        ) {
            drone = droneList[droneIndex];
        }

        require(
            (droneIndex == 0 && drone.droneAddress == address(0)) ||
                drone.isDeleted,
            "Drone already added."
        );

        drone.isDeleted = false;
        drone.droneId = _droneId;
        drone.droneType = _droneType;

        if (droneIndex == 0 && drone.droneAddress == address(0)) {
            drone.droneAddress = _droneAddress;
            droneList.push(drone);
            uint256 newDroneIndex = droneList.length - 1;
            droneList[newDroneIndex].index = newDroneIndex;
            droneIndexMap[_droneAddress] = newDroneIndex;
        } else {
            droneList[droneIndex] = drone;
        }

        emit DroneAdded(_droneAddress);
    }

    /**
     * @notice Delete a drone for a given address.
     *
     * @param _droneAddress The drone address.
     */
    function deleteDrone(address _droneAddress)
        external
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
    {
        uint256 droneIndex = droneIndexMap[_droneAddress];
        require(droneIndex < droneList.length, "Out of size index.");
        require(
            droneList[droneIndex].droneAddress != address(0) &&
                droneList[droneIndex].droneAddress == _droneAddress,
            "Drone not found."
        );

        droneList[droneIndex].isDeleted = true;

        emit DroneDeleted(_droneAddress);
    }

    /**
     * @notice Get the index of a drone from a drone address.
     *
     * @param _droneAddress The drone address.
     *
     * @return The index of a drone.
     */
    function getDroneIndex(address _droneAddress)
        external
        view
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (uint256)
    {
        return droneIndexMap[_droneAddress];
    }

    /**
     * @notice Get the AccessControl address.
     *
     * @return The AccessControl address.
     */
    function getAccessControlAddress() external view returns (address) {
        return address(accessControl);
    }

    /**
     * @notice Get the ConopsManager address.
     *
     * @return The ConopsManager address.
     */
    function getConopsManager() external view returns (address) {
        return address(conopsManager);
    }

    /**
     * @notice Get the DeliveryManager address.
     *
     * @return The DeliveryManager address.
     */
    function getDeliveryManager() external view returns (address) {
        return address(deliveryManager);
    }

    /**
     * @notice Add a DroneFlight from the address.
     *
     * @dev Only DroneFlightFactory contract is allowed to add a contract.
     *
     * @param _droneFlightAddress The DroneFlight address.
     * @param _pilotAddress The pilot address.
     * @param _droneAddress The drone address.
     */
    function addDroneFlight(
        address _droneFlightAddress,
        address _pilotAddress,
        address _droneAddress
    ) external {
        require(msg.sender == droneFlightFactoryAddress, "not allowed");
        uint256 pilotIndex = pilotIndexMap[_pilotAddress];
        require(pilotIndex < pilotList.length, "Out of size index.");
        require(
            pilotList[pilotIndex].pilotAddress != address(0) &&
                pilotList[pilotIndex].pilotAddress == _pilotAddress,
            "Pilot not found."
        );
        uint256 droneIndex = droneIndexMap[_droneAddress];
        require(droneIndex < droneList.length, "Out of size index.");
        require(
            droneList[droneIndex].droneAddress != address(0) &&
                droneList[droneIndex].droneAddress == _droneAddress,
            "Drone not found."
        );

        droneFlightAddressList.push(_droneFlightAddress);
        pilotList[pilotIndex].flightAddresses.push(_droneFlightAddress);
        droneList[droneIndex].flightAddresses.push(_droneFlightAddress);
    }
}
