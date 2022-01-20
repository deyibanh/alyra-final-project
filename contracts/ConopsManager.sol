//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IConopsManager.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/**
 * @title The ConopsManager contract.
 *
 * @author Starwings
 *
 * @notice This contract manage all the Conops. Admins can add a simple Conops and enable/disable it.
 */
contract ConopsManager is IConopsManager {
    /**
     * @dev A list of SimpleConops.
     */
    StarwingsDataLib.SimpleConops[] private simpleConopsList;

    /**
     * @dev The IAccessControl contract.
     */
    IAccessControl private accessControl;

    /**
     * @notice Modifier to restrict function to specific role.
     *
     * @dev Use the library to retrieve bytes32 values when calling the modifier.
     *
     * @param _role The role authorize to access the function.
     */
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access refused");
        _;
    }

    /**
     * @notice The constructor.
     *
     * @param _accessControlAddress The IAccessControl address.
     */
    constructor(address _accessControlAddress) {
        accessControl = IAccessControl(_accessControlAddress);
    }

    /**
     * @inheritdoc IConopsManager
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
    )
        external
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (uint256 conopsID)
    {
        StarwingsDataLib.SimpleConops storage simpleConops = simpleConopsList.push();

        simpleConops.activated = true;
        simpleConops.name = _name;
        simpleConops.startingPoint = _startingPoint;
        simpleConops.endPoint = _endPoint;
        simpleConops.crossRoad = _crossRoad;
        simpleConops.exclusionZone = _exclusionZone;
        simpleConops.grc = _grc;
        simpleConops.arc = _arc;
        for (uint256 i = 0; i < _airRisks.length; i++) {
            simpleConops.airRiskList.push(_airRisks[i]);
        }

        conopsID = simpleConopsList.length - 1;

        emit ConopsCreated(conopsID, _name);
    }

    /**
     * @inheritdoc IConopsManager
     */
    function disable(uint256 _conopsID)
        external
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
    {
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
     * @inheritdoc IConopsManager
     */
    function enable(uint256 _conopsID)
        external
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
    {
        require(_conopsID < simpleConopsList.length, "Conops does not exist");
        require(
            !simpleConopsList[_conopsID].activated,
            "Conops already activated"
        );
        simpleConopsList[_conopsID].activated = true;

        emit ConopsEnable(_conopsID);
    }

    /**
     * @inheritdoc IConopsManager
     */
    function viewConops(uint256 _conopsID)
        external
        view
        returns (StarwingsDataLib.SimpleConops memory)
    {
        return simpleConopsList[_conopsID];
    }

    /**
     * @inheritdoc IConopsManager
     */
    function viewAllConops() external view returns (StarwingsDataLib.SimpleConops[] memory) {
        return simpleConopsList;
    }
}
