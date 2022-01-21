//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import { StarwingsDataLib } from "../librairies/StarwingsDataLib.sol";

/**
 * @title The IStarwingsMaster interface.
 *
 * @author Starwings
 *
 * @notice This is the IStarwingsMaster interface that manages accesses.
 */
interface IStarwingsMaster {
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
    ) external;

    /**
     * @notice Get the AccessControl address.
     *
     * @return The AccessControl address.
     */
    function getAccessControlAddress() external view returns (address);

    /**
     * @notice Get the ConopsManager address.
     *
     * @return The ConopsManager address.
     */
    function getConopsManager() external view returns (address);

    /**
     * @notice Get the DeliveryManager address.
     *
     * @return The DeliveryManager address.
     */
    function getDeliveryManager() external view returns (address);

    /**
     * @notice Get the pilot information for a given address.
     *
     * @param _pilotAddress The pilot address.
     *
     * @return The pilot information.
     */
    function getPilot(address _pilotAddress) external view returns (StarwingsDataLib.Pilot memory);

    /**
     * @notice Get the drone information for a given address.
     *
     * @param _droneAddress The drone address.
     *
     * @return The drone information.
     */
    function getDrone(address _droneAddress) external view returns (StarwingsDataLib.Drone memory);
}
