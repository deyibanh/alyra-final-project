//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import { StarwingsDataLib } from "../librairies/StarwingsDataLib.sol";

/**
 * @title The IConopsManager interface.
 *
 * @author Starwings
 *
 * @notice This is the IConopsManager interface that manages Conops.
 */
interface IConopsManager {
    /**
     * @notice Add a Conops.
     *
     * @param _name Name of the conops.
     * @param _startingPoint Solution used to secure the starting point.
     * @param _endPoint Solution used to secure the arrivfal point.
     * @param _crossRoad Solution used to secure the road.
     * @param _exclusionZone Solution used to secure a specific zone.
     * @param _airRisks List of airRisks.
     * @param _grc Ground Risk score.
     * @param _arc Air Risk score.
     *
     * @return _conopsID The Conops ID.
     */
    function addConops(
        string memory _name,
        string memory _startingPoint,
        string memory _endPoint,
        string memory _crossRoad,
        string memory _exclusionZone,
        StarwingsDataLib.AirRisk[] memory _airRisks,
        uint8 _grc,
        uint8 _arc
    ) external returns (uint256 _conopsID);

    /**
     * @notice Set a specific conops activated status to false.
     *
     * @param _conopsID Index of the conops in simpleConopsList array.
     */
    function disable(uint256 _conopsID) external;

    /**
     * @notice Set a specific conops activated status to true.
     *
     * @param _conopsID Index of the conops in simpleConopsList array.
     */
    function enable(uint256 _conopsID) external;

    /**
     * @notice Return the specified Conops.
     *
     * @param _conopsID Index of the Conops in simpleConopsList array.
     *
     * @return A SimpleConops.
     */
    function viewConops(uint256 _conopsID) external view returns (StarwingsDataLib.SimpleConops memory);

    /**
     * @notice Return all Conops.
     *
     * @return The list of Conops.
     */
    function viewAllConops() external view returns (StarwingsDataLib.SimpleConops[] memory);

    /**
     * @notice Event emitted when a Conops is created.
     *
     * @param _conopsID Index of the Conops in simpleConopsList array.
     * @param _name Label of the Conops.
     */
    event ConopsCreated(uint256 _conopsID, string _name);

    /**
     * @notice Event emitted when the Conops activated status switch to false.
     *
     * @param _conopsID Index of the Conops in simpleConopsList array.
     */
    event ConopsDisable(uint256 _conopsID);

    /**
     * @notice Event emitted when the conops activated status switch to true.
     *
     * @param _conopsID Index of the Conops in simpleConopsList array.
     */
    event ConopsEnable(uint256 _conopsID);
}
