// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./interfaces/IConopsManager.sol";
import "./interfaces/IDeliveryManager.sol";
import "./interfaces/IStarwingsMaster.sol";

/**
 * @title The StarwingsMaster contract.
 *
 * @author Dé Yi Banh (@deyibanh)
 *
 * @notice This contract manages drone flights creation from CONOPS.
 */
contract StarwingsMaster is IStarwingsMaster {
    /**
     * @dev Pilot struct.
     */
    struct Pilot {
        uint index;
        bool isDeleted;
        string name;
        address pilotAddress;
        address[] flightAddresses;
    }

    /**
     * @dev Drone struct.
     */
    struct Drone {
        uint index;
        bool isDeleted;
        string droneId;
        string droneType;
        address droneAddress;
        address[] flightAddresses;
    }

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
    Pilot[] private pilotList;

    /**
     * @dev A list of Drone.
     */
    Drone[] private droneList;

    /**
     * @dev A map of a pilot address and an index of the pilot list.
     */
    mapping(address => uint) private pilotIndexMap;

    /**
     * @dev A map of a drone address and an index of the drone list.
     */
    mapping(address => uint) private droneIndexMap;

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
        onlyRole("ADMIN_ROLE")
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
        onlyRole("ADMIN_ROLE")
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
        onlyRole("ADMIN_ROLE")
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
        onlyRole("ADMIN_ROLE")
        returns (address)
    {
        return droneFlightAddressList[_droneFlightId];
    }

    /**
     * @notice Get a list of Pilot.
     *
     * @return A list of Pilot.
     */
    function getPilotList() external view onlyRole("ADMIN_ROLE") returns (Pilot[] memory) {
        return pilotList;
    }

    /**
     * @notice Get the pilot information for a given address.
     *
     * @param _pilotAddress The pilot address.
     *
     * @return The pilot information.
     */
    function getPilot(address _pilotAddress) external view onlyRole("ADMIN_ROLE") returns (Pilot memory) {
        uint pilotIndex = pilotIndexMap[_pilotAddress];
        require(pilotIndex < pilotList.length, "Out of size index.");
        require(pilotList[pilotIndex].pilotAddress != address(0), "Pilot not found.");

        return pilotList[pilotIndex];
    }

    /**
     * @notice Add a pilot for a given address.
     *
     * @dev The pilot can be added only if he is not registered yet or if he have been deleted.
     *
     * @param _pilotAddress The pilot address.
     * @param _pilotName The pilot name.
     *
     * @return The pilot information.
     */
    function addPilot(address _pilotAddress, string memory _pilotName)
        external
        onlyRole("ADMIN_ROLE")
        returns (Pilot memory)
    {
        uint pilotIndex = pilotIndexMap[_pilotAddress];
        Pilot storage pilot = pilotList[pilotIndex];

        require(
            (pilotIndex == 0 && pilot.pilotAddress == address(0)) ||
            !pilot.isDeleted,
            "Pilot already added."
        );

        pilot.isDeleted = false;
        pilot.name = _pilotName;

        if (pilotIndex == 0 && pilot.pilotAddress == address(0)) {
            pilot.pilotAddress = _pilotAddress;
            pilotList.push(pilot);
            pilot.index = pilotList.length - 1;
            pilotIndexMap[_pilotAddress] = pilot.index;
        }
        
        return pilot;
    }

    /**
     * @notice Delete a pilot for a given address.
     *
     * @param _pilotAddress The pilot address.
     */
    function deletePilot(address _pilotAddress) external onlyRole("ADMIN_ROLE") {
        uint pilotIndex = pilotIndexMap[_pilotAddress];
        require(pilotIndex < pilotList.length, "Out of size index.");
        require(pilotList[pilotIndex].pilotAddress != address(0), "Pilot not found.");

        pilotList[pilotIndex].isDeleted = false;
    }

    /**
     * @notice Get the index of a pilot from a pilot address.
     *
     * @param _pilotAddress The pilot address.
     *
     * @return The index of a pilot.
     */
    function getPilotIndex(address _pilotAddress) external view onlyRole("ADMIN_ROLE") returns (uint) {
        return pilotIndexMap[_pilotAddress];
    }

    /**
     * @notice Get a list of Drone.
     *
     * @return A list of Drone.
     */
    function getDroneList() external view onlyRole("ADMIN_ROLE") returns (Drone[] memory) {
        return droneList;
    }

    /**
     * @notice Get the drone information for a given address.
     *
     * @param _droneAddress The drone address.
     *
     * @return The drone information.
     */
    function getDrone(address _droneAddress) external view onlyRole("ADMIN_ROLE") returns (Drone memory) {
        uint droneIndex = droneIndexMap[_droneAddress];
        require(droneIndex < droneList.length, "Out of size index.");
        require(droneList[droneIndex].droneAddress != address(0), "Drone not found.");

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
     *
     * @return The Drone information.
     */
    function addDrone(address _droneAddress, string memory _droneId, string memory _droneType)
        external
        onlyRole("ADMIN_ROLE")
        returns (Drone memory)
    {
        uint droneIndex = droneIndexMap[_droneAddress];
        Drone storage drone = droneList[droneIndex];

        require(
            (droneIndex == 0 && drone.droneAddress == address(0)) ||
            !drone.isDeleted,
            "Drone already added."
        );

        drone.isDeleted = false;
        drone.droneId = _droneId;
        drone.droneType = _droneType;

        if (droneIndex == 0 && drone.droneAddress == address(0)) {
            drone.droneAddress = _droneAddress;
            droneList.push(drone);
            drone.index = droneList.length - 1;
            droneIndexMap[_droneAddress] = drone.index;
        }
        
        return drone;
    }

    /**
     * @notice Delete a drone for a given address.
     *
     * @param _droneAddress The drone address.
     */
    function deleteDrone(address _droneAddress) external onlyRole("ADMIN_ROLE") {
        uint droneIndex = droneIndexMap[_droneAddress];
        require(droneIndex < droneList.length, "Out of size index.");
        require(droneList[droneIndex].droneAddress != address(0), "Drone not found.");

        droneList[droneIndex].isDeleted = false;
    }

    /**
     * @notice Get the index of a drone from a drone address.
     *
     * @param _droneAddress The drone address.
     *
     * @return The index of a drone.
     */
    function getDroneIndex(address _droneAddress) external view onlyRole("ADMIN_ROLE") returns (uint) {
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
        uint pilotIndex = pilotIndexMap[_pilotAddress];
        require(pilotIndex < pilotList.length, "Out of size index.");
        require(pilotList[pilotIndex].pilotAddress != address(0), "Pilot not found.");
        uint droneIndex = droneIndexMap[_droneAddress];
        require(droneIndex < droneList.length, "Out of size index.");
        require(droneList[droneIndex].droneAddress != address(0), "Pilot not found.");

        droneFlightAddressList.push(_droneFlightAddress);
        pilotList[pilotIndex].flightAddresses.push(_droneFlightAddress);
        droneList[droneIndex].flightAddresses.push(_droneFlightAddress);
    }
}
