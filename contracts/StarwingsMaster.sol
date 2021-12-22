// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./interfaces/IConopsMaster.sol";
import "./interfaces/IDeliveryMaster.sol";

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
     * @dev The ConopsManager contract.
     */
    IConopsMaster private conopsManager;

    /**
     * @dev The DeliveryMaster contract.
     */
    IDeliveryMaster private deliveryMaster;

    /**
     * @notice The constructor.
     *
     * @param _conopsManagerAddress The ConopsManager address.
     * @param _deliveryMasterAddress The DeliveryMaster address.
     */
    constructor(address _conopsManagerAddress, address _deliveryMasterAddress) {
        conopsManager = IConopsMaster(_conopsManagerAddress);
        deliveryMaster = IDeliveryMaster(_deliveryMasterAddress);
    }

    /**
     * @notice Get the DroneFlightFactory address.
     *
     * @return The DroneFlightFactory address.
     */
    function getDroneFlightFactoryAddress() external view returns (address) {
        return droneFlightFactoryAddress;
    }

    /**
     * @notice Set the DroneFlightFactory address.
     *
     * @param _droneFlightFactoryAddress The DroneFlightFactory address to set.
     */
    function setDroneFlightFactoryAddress(address _droneFlightFactoryAddress) external {
        droneFlightFactoryAddress = _droneFlightFactoryAddress;
    }

    /**
     * @notice Get a list of DroneFlight address.
     *
     * @return A list of DroneFlight address.
     */
    function getDroneFlightAddressList() external view returns (address[] memory) {
        return droneFlightAddressList;
    }

    /**
     * @notice Get the DroneFlight address from id.
     *
     * @param _droneFlightId The DroneFlight id.
     *
     * @return The DroneFlight address.
     */
    function getDroneFlightAddress(uint _droneFlightId) external view returns (address) {
        return droneFlightAddressList[_droneFlightId];
    }

    /**
     * @notice Get a list of pilot address.
     *
     * @return A list of pilot address.
     */
    function getPilotAddressList() external view returns (address[] memory) {
        return pilotAddressList;
    }

    /**
     * @notice Get a list of drone address.
     *
     * @return A list of drone address.
     */
    function getDroneAddressList() external view returns (address[] memory) {
        return droneAddressList;
    }

    /**
     * @notice Get a list of DroneFlight address from a pilot address.
     *
     * @return A list of DroneFlight address.
     */
    function getPilotFlightAddresses(address _pilotAddress) external view returns (address[] memory) {
        return pilotFlightAddressesMap[_pilotAddress];
    }

    /**
     * @notice Get a list of DroneFlight address from a drone address.
     *
     * @return A list of DroneFlight address.
     */
    function getDroneFlightAddresses(address _pilotAddress) external view returns (address[] memory) {
        return droneFlightAddressesMap[_pilotAddress];
    }

    /**
     * @notice Get the pilot flight authorization from a pilot address.
     *
     * @return The pilot flight authorization.
     */
    function getPilotAuthorized(address _pilotAddress) external view returns (bool) {
        return pilotAuthorizedMap[_pilotAddress];
    }
}
