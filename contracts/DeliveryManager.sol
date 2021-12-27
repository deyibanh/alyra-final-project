//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./interfaces/IDeliveryManager.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";
import "hardhat/console.sol";

/**
 *   @title Delivery Master
 *   @author Damien
 *  @notice This contract manage all the deliveries.
 */
contract DeliveryManager is IDeliveryManager {
    using Strings for uint256;
    // 1. State variables
    mapping(string => Delivery) private deliveries;
    //Delivery[] private deliveryList;
    IAccessControl private accessControl;

    // 2. Events
    event DeliveryCreated(string deliveryId);

    // 3. Function Modifiers

    /// @notice Modifier to restrict function to specific role
    /// @dev Use the library to retrieve bytes32 values when calling the modifier
    /// @param _role The role authorize to access the function
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access refused");
        _;
    }

    // 4. Struct, Arrays or Enums
    // 5. Constructor
    constructor(address accessControlAddress) {
        accessControl = IAccessControl(accessControlAddress);
    }

    // 6. Fallback — Receive function
    // 7. External visible functions

    /// @notice Explain to an end user what this does
    /// @dev Explain to a developer any extra details
    /// @param _delivery a parameter just like in doxygen (must be followed by parameter name)
    /// @return Documents the return variables of a contract’s function state variable
    function newDelivery(Delivery memory _delivery)
        external
        onlyRole(StarwingsDataLib.ADMIN_ROLE)
        returns (string memory)
    {
        require(bytes(_delivery.supplierOrderId).length > 0, "orderId:empty");
        require(bytes(_delivery.from).length > 0, "from:empty");
        require(_delivery.fromAddr != address(0), "fromAddr:0x0");
        require(bytes(_delivery.to).length > 0, "to:empty");
        require(_delivery.toAddr != address(0), "toAddr:0x0");
        require(_delivery.fromHubId != 0, "fromHubId:0");
        require(_delivery.toHubId != 0, "toHubId:0");

        _delivery.state = DeliveryState.noInfo;
        _delivery.deliveryId = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    _delivery.fromAddr,
                    _delivery.toAddr,
                    _delivery.supplierOrderId
                )
            )
        ).toHexString();

        deliveries[_delivery.deliveryId] = _delivery;

        console.log("[Contract Debug] DeliveryId:%s", _delivery.deliveryId);
        console.log("[Contract Debug] OrderId:%s", _delivery.supplierOrderId);
        console.log("[Contract Debug] toAddr:%s", _delivery.toAddr);
        console.log("[Contract Debug] fromAddr:%s", _delivery.fromAddr);

        emit DeliveryCreated(_delivery.deliveryId);

        return _delivery.deliveryId;
    }

    /// @notice Explain to an end user what this does
    /// @dev Explain to a developer any extra details
    /// @param _deliveryId a parameter just like in doxygen (must be followed by parameter name)
    /// @return Documents the return variables of a contract’s function state variable
    function getDelivery(string memory _deliveryId)
        external
        view
        returns (Delivery memory)
    {
        console.log("[Contract Debug] get DeliveryId:%s", _deliveryId);
        console.log(
            "[Contract Debug] get toAddr:%s",
            deliveries[_deliveryId].toAddr
        );
        require(
            bytes(deliveries[_deliveryId].deliveryId).length > 0,
            "Delivery does not exist"
        );

        return deliveries[_deliveryId];
    }

    /// @notice Explain to an end user what this does
    /// @dev Explain to a developer any extra details
    /// @param _deliveryId a parameter just like in doxygen (must be followed by parameter name)
    /// @param _deliveryState a parameter just like in doxygen (must be followed by parameter name)
    /// @return Documents the return variables of a contract’s function state variable
    function setDeliveryState(
        string memory _deliveryId,
        DeliveryState _deliveryState
    ) external returns (bool) {
        require(
            deliveries[_deliveryId].toAddr != address(0),
            "Delivery does not exist"
        );
        deliveries[_deliveryId].state = _deliveryState;
        return true;
    }

    // 8. Public visible functions
    // 9. Internal visible functions
    // 10. Private visible functions
    // function getDeliveries()
    //     external
    //     view
    //     returns (Delivery[] memory)
    // {
    //     return deliveryList;
    // }
}
