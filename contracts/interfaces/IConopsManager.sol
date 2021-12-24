//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IConopsManager {
    struct AirRisk {
        string name;
        AirRiskType riskType;
    }

    struct SimpleConops {
        bool activated;
        string name;
        string startingPoint;
        string endPoint;
        string crossRoad;
        string exclusionZone;
        uint8 grc;
        uint8 arc;
        AirRisk[] airRiskList;
    }

    enum AirRiskType {
        Aerodrome,
        CHU,
        MilitaryBase
    }

    function addConops(
        string memory _name,
        string memory _startingPoint,
        string memory _endPoint,
        string memory _crossRoad,
        string memory _exclusionZone,
        string[] memory _entities,
        uint256[] memory _airRiskType,
        uint8 _grc,
        uint8 _arc
    ) external returns (uint256 _conopsID);

    function disable(uint256 _conopsID) external;

    function enable(uint256 _conopsID) external;

    function viewConops(uint256 _conopsID)
        external
        view
        returns (SimpleConops memory);

    function viewAllConops() external view returns (SimpleConops[] memory);

    /**
        @notice event emited when a conops is created
        @param _conopsID Index of the conops in simpleConopsList array:
        @param _name Label of the conops
     */
    event ConopsCreated(uint256 _conopsID, string _name);

    /**
        @notice event emited when the conops activated status switch to false
        @param _conopsID Index of the conops in simpleConopsList array:
     */
    event ConopsDisable(uint256 _conopsID);

    /**
        @notice event emited when the conops activated status switch to true
        @param _conopsID Index of the conops in simpleConopsList array:
     */
    event ConopsEnable(uint256 _conopsID);
}
