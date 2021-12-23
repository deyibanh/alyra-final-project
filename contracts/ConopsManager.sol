//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./interfaces/IConopsManager.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 *   @title Conops
 *   @author Damien
 *  @notice This contract manage all the conops. Admins can add a simple Conop^s and enable/disable it
 */
contract ConopsManager is IConopsManager {
    SimpleConops[] private simpleConopsList;
    IAccessControl private accessControl;

    constructor(address accessControlAddress) {
        accessControl = IAccessControl(accessControlAddress);
    }

    modifier onlyRole(string memory role) {
        bytes32 byteRole = keccak256(abi.encodePacked(role));
        require(
            accessControl.hasRole(byteRole, msg.sender),
            "you don't have the role"
        );
        _;
    }

    /**
     *  @notice Add a Conops
     *  @dev AirRisk is constructed with the lists _entities and _airRiskType.
     *  @param _name Name of the conops,
     *  @param _startingPoint Solution used to secure the starting point,
     *  @param _endPoint Solution used to secure the arrivfal point,
     *  @param _crossRoad Solution used to secure the road,
     *  @param _exclusionZone Solution used to secure a specific zone,
     *  @param _entities List of labels representing the risky entities,
     *  @param _airRiskType List of uint whoes refer to the enum AirRiskType for the corresponding entity,
     *  @param _grc Ground Risk score,
     *  @param _arc Air Risk score,
     */
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
    ) external onlyRole("ADMIN_ROLE") returns (uint256 conopsID) {
        require(
            _entities.length == _airRiskType.length,
            "lists error: number of elements"
        );
        SimpleConops storage simpleConops = simpleConopsList.push();

        simpleConops.activated = true;
        simpleConops.name = _name;
        simpleConops.startingPoint = _startingPoint;
        simpleConops.endPoint = _endPoint;
        simpleConops.crossRoad = _crossRoad;
        simpleConops.exclusionZone = _exclusionZone;
        simpleConops.grc = _grc;
        simpleConops.arc = _arc;

        for (uint256 i = 0; i < _entities.length; i++) {
            AirRisk memory airRisk = AirRisk(
                _entities[i],
                AirRiskType(_airRiskType[i])
            );
            simpleConops.airRiskList.push(airRisk);
        }

        conopsID = simpleConopsList.length - 1;

        emit ConopsCreated(conopsID, _name);
    }

    /**
     *  @notice Set a specific conops activated status to false
     *  @param _conopsID Index of the conops in simpleConopsList array:
     */
    function disable(uint256 _conopsID) external onlyRole("ADMIN_ROLE") {
        require(_conopsID < simpleConopsList.length, "Conops does not exist");
        require(
            simpleConopsList[_conopsID].activated,
            "Conops already suspended"
        );
        simpleConopsList[_conopsID].activated = false;

        emit ConopsDisable(_conopsID);
        (_conopsID);
    }

    /**
     *  @notice Set a specific conops activated status to true
     *  @param _conopsID Index of the conops in simpleConopsList array:
     */
    function enable(uint256 _conopsID) external onlyRole("ADMIN_ROLE") {
        require(_conopsID < simpleConopsList.length, "Conops does not exist");
        require(
            !simpleConopsList[_conopsID].activated,
            "Conops already activated"
        );
        simpleConopsList[_conopsID].activated = true;

        emit ConopsEnable(_conopsID);
    }

    /**
     *  @notice return the specified conops
     *  @param _conopsID Index of the conops in simpleConopsList array:
     */
    function viewConops(uint256 _conopsID)
        external
        view
        returns (SimpleConops memory)
    {
        return simpleConopsList[_conopsID];
    }

    /**
     *  @notice return all conops
     */
    function viewAllConops() external view returns (SimpleConops[] memory) {
        return simpleConopsList;
    }
}
