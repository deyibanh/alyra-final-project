//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

/**
 *   @title Conops
 *   @author Damien
 *  @notice This contract manage all the conops. Admins can add a simple Conop^s and enable/disable it
 */
interface IDroneFlightFactory {
    function newDroneFlight(uint8 _type)
        external
        returns (address);
}
