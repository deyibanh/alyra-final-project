//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "./interfaces/IStarwingsMaster.sol";
import "./interfaces/IDeliveryManager.sol";
import "./interfaces/IDroneFlight.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/**
 *   @title DroneFlightFactory
 *   @author Damien
 *  @notice This contract serve as a factory for deploying new DroneFlight contract of different types.
 */
contract DroneFlightFactory {
    using StarwingsDataLib for StarwingsDataLib.FlightData;

    IAccessControl private accessControl;
    IStarwingsMaster private starwingsMaster;
    address[] public deployedContracts;
    event Deployed(address addr, uint256 salt);

    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access Refused");
        _;
    }

    enum FlightType {
        delivery,
        photo,
        taxi
    }

    constructor(address accessControlAddress, address starwingsMasterAddress) {
        accessControl = IAccessControl(accessControlAddress);
        starwingsMaster = IStarwingsMaster(starwingsMasterAddress);
    }

    function deploy(bytes memory code, uint256 salt)
        external
        onlyRole(StarwingsDataLib.PILOT_ROLE)
    {
        address addr;
        assembly {
            addr := create2(0, add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        deployedContracts.push(addr);

        emit Deployed(addr, salt);
    }

    // function newDroneDelivery(
    //     string memory _deliveryId,
    //     address _drone,
    //     uint256 _conopsId,
    //     uint256 _flightDatetime,
    //     uint256 _flightDuration,
    //     string memory _depart,
    //     string memory _destination,
    //     address droneDeliveryAddr
    // )
    //     external
    //     onlyRole(StarwingsDataLib.PILOT_ROLE)
    //     returns (address droneDeliveryAddress)
    // {
    //     // StarwingsDataLib.FlightData memory flightData = StarwingsDataLib
    //     //     .FlightData(
    //     //         starwingsMaster.getPilot(msg.sender),
    //     //         starwingsMaster.getDrone(_drone),
    //     //         _conopsId,
    //     //         _flightDatetime,
    //     //         _flightDuration,
    //     //         _depart,
    //     //         _destination
    //     //     );

    //     // IDeliveryManager deliveryManager = IDeliveryManager(
    //     //     starwingsMaster.getDeliveryManager()
    //     // );

    //     return address(droneDeliveryAddr);
    // }

    // function _newDroneDelivery(
    //     string memory _deliveryId,
    //     StarwingsDataLib.FlightData memory flightData
    // )
    //     internal
    //     returns (address droneDeliveryAddress)
    // {
    //     IDeliveryManager deliveryManager = IDeliveryManager(starwingsMaster.getDeliveryManager());

    //     DroneDelivery droneDelivery = new DroneDelivery(
    //         starwingsMaster.getDeliveryManager(),
    //         _deliveryId,
    //         starwingsMaster.getConopsManager(),
    //         starwingsMaster.getAccessControlAddress(),
    //         flightData
    //     );

    //     droneDeliveryAddress = address(droneDelivery);
    //     deployedContracts.push(droneDeliveryAddress);
    //     starwingsMaster.addDroneFlight(
    //         droneDeliveryAddress,
    //         flightData.pilot.pilotAddress,
    //         flightData.drone.droneAddress
    //     );

    //     deliveryManager.setDeliveryState(_deliveryId, IDeliveryManager.DeliveryState(3));
    // }

    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
}
