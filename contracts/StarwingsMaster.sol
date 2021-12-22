// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./interfaces/IConopsManager.sol";
import "./interfaces/IDeliveryManager.sol";
import "./interfaces/IDroneFlightFactory.sol";

/**
 * @title The StarwingsMaster contract.
 *
 * @author Dé Yi Banh (@deyibanh)
 *
 * @notice This contract manages drone flights creation from CONOPS.
 */
contract StarwingsMaster {
    /**
     * @dev The DroneFlightFactory address.
     */
    address private droneFlightFactoryAddress;

    /**
     * @dev A list of DroneFlight address.
     */
    address[] private droneFlightAddressList;

    /**
     * @dev A list of pilot address.
     */
    address[] private pilotAddressList;

    /**
     * @dev A list of drone address.
     */
    address[] private droneAddressList;

    /**
     * @dev A map of a pilot address and a boolean for pilot flight authorization.
     */
    mapping(address => bool) private pilotAuthorizedMap;

    /**
     * @dev A map of a pilot address and a list of DroneFlight address.
     */
    mapping(address => address[]) private pilotFlightAddressesMap;

    /**
     * @dev A map of a drone address and a list of DroneFlight address.
     */
    mapping(address => address[]) private droneFlightAddressesMap;

    /**
     * @dev The IAccessControl contract.
     */
    IAccessControl private accessControl;

    /**
     * @dev The ConopsManager contract.
     */
    IConopsManager private conopsManager;

    /**
     * @dev The DeliveryMaster contract.
     */
    IDeliveryManager private deliveryMaster;

    /**
     * @dev Check the msg.sender's role.
     */
    modifier onlyRole(string memory role) {
        bytes32 byteRole = keccak256(abi.encodePacked(role));
        require(
            accessControl.hasRole(byteRole, msg.sender),
            "you don't have the role"
        );
        _;
    }

    /**
     * @notice The constructor.
     *
     * @param _accessControlAddress The IAccessControl address.
     * @param _conopsManagerAddress The ConopsManager address.
     * @param _deliveryMasterAddress The DeliveryMaster address.
     */
    constructor(
        address _accessControlAddress,
        address _conopsManagerAddress,
        address _deliveryMasterAddress
    ) {
        accessControl = IAccessControl(_accessControlAddress);
        conopsManager = IConopsManager(_conopsManagerAddress);
        deliveryMaster = IDeliveryManager(_deliveryMasterAddress);
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
     * @notice Get a list of pilot address.
     *
     * @return A list of pilot address.
     */
    function getPilotAddressList()
        external
        view
        onlyRole("ADMIN_ROLE")
        returns (address[] memory)
    {
        return pilotAddressList;
    }

    /**
     * @notice Get a list of drone address.
     *
     * @return A list of drone address.
     */
    function getDroneAddressList()
        external
        view
        onlyRole("ADMIN_ROLE")
        returns (address[] memory)
    {
        return droneAddressList;
    }

    /**
     * @notice Get a list of DroneFlight address from a pilot address.
     *
     * @return A list of DroneFlight address.
     */
    function getPilotFlightAddresses(address _pilotAddress)
        external
        view
        onlyRole("ADMIN_ROLE")
        returns (address[] memory)
    {
        return pilotFlightAddressesMap[_pilotAddress];
    }

    /**
     * @notice Get a list of DroneFlight address from a drone address.
     *
     * @return A list of DroneFlight address.
     */
    function getDroneFlightAddresses(address _pilotAddress)
        external
        view
        onlyRole("ADMIN_ROLE")
        returns (address[] memory)
    {
        return droneFlightAddressesMap[_pilotAddress];
    }

    /**
     * @notice Get the pilot flight authorization from a pilot address.
     *
     * @return The pilot flight authorization.
     */
    function getPilotAuthorized(address _pilotAddress)
        external
        view
        onlyRole("ADMIN_ROLE")
        returns (bool)
    {
        return pilotAuthorizedMap[_pilotAddress];
    }

    /**
     * @notice Add a DroneDelivery.
     *
     * @param _droneAddress The drone address.
     * @param _conopsID The conops ID.
     */
    function addDroneDelivery(address _droneAddress, uint256 _conopsID)
        external
        onlyRole("PILOT_ROLE")
    {
        IDroneFlightFactory droneFlightFactory = IDroneFlightFactory(
            droneFlightFactoryAddress
        );
        droneFlightFactory.newDroneFlight(0);
    }

    /**
     * @notice Add a DroneDelivery with .
     *
     * @param _droneAddress The drone address.
     * @param _conopsID The conops ID.
     * @param _deliveryID The develivery ID.
     */
    function addDroneDeliveryWithID(
        address _droneAddress,
        uint256 _conopsID,
        uint256 _deliveryID
    ) external onlyRole("PILOT_ROLE") {
        IDroneFlightFactory droneFlightFactory = IDroneFlightFactory(
            droneFlightFactoryAddress
        );
        droneFlightFactory.newDroneFlight(0);
    }
}
