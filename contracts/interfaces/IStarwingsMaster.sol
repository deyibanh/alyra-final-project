//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

/**
 *   @title Conops
 *   @author Damien
 *  @notice This contract manage all the conops. Admins can add a simple Conop^s and enable/disable it
 */
interface IStarwingsMaster {
    function addDroneFlightAddress(address droneFlightaddress) external;

    function getDeliveryManager() external view returns (address);

    function getConopsManager() external view returns (address);
}
