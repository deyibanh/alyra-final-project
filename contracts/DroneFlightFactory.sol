//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./interfaces/IDroneFlightFactory.sol";
import "./DroneDelivery.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/**
 *   @title DroneFlightFactory
 *   @author Damien
 *  @notice This contract serve as a factory for deploying new DroneFlight contract of different types.
 */
contract DroneFlightFactory is IDroneFlightFactory {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    IAccessControl private accessControl;
    address[] public deployedContracts;

    enum FlightType {
        delivery,
        photo,
        taxi
    }

    constructor(address accessControlAddress) {
        accessControl = IAccessControl(accessControlAddress);
    }

    modifier onlyRole(bytes32 _role) {
        //bytes32 byteRole = keccak256(abi.encodePacked(_role));
        require(
            accessControl.hasRole(_role, msg.sender),
            "you don't have the role"
        );
        _;
    }

    modifier isAllowedTypeFlight(uint8 _type) {
        require(
            _type <= uint256(type(FlightType).max),
            "type of flight not allowed"
        );
        _;
    }

    function newDroneFlight(uint8 _type)
        external
        isAllowedTypeFlight(_type)
        onlyRole(StarwingsDataLib.PILOT_ROLE)
        returns (address newContract)
    {
        // if (_type == uint256(FlightType.delivery)) {
        //     newContract = _newDroneDelivery();
        // }
    }

    function _newDroneDelivery(
        address _deliveryManager,
        uint256 _deliveryId,
        // DroneFlight
        address _conopsManager,
        StarwingsDataLib.FlightData memory data
    ) internal returns (address) {
        DroneDelivery droneDelivery = new DroneDelivery(
            _deliveryManager,
            _deliveryId,
            _conopsManager,
            data
        );
        deployedContracts.push(address(droneDelivery));

        return address(droneDelivery);
    }

    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
}
