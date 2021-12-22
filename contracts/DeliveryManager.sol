//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./interfaces/IDeliveryManager.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import {StarwingsDataLib} from "./librairies/StarwingsDataLib.sol";

/**
 *   @title Delivery Master
 *   @author Damien
 *  @notice This contract manage all the deliveries.
 */
contract DeliveryManager is IDeliveryManager {
    Delivery[] private deliveryList;
    IAccessControl private accessControl;
    CommercialData private commercialData;

    constructor(address accessControlAddress) {
        accessControl = IAccessControl(accessControlAddress);
    }

    /// @notice Modifier to restrict function to specific role
    /// @dev Use the library to retrieve bytes32 values when calling the modifier
    /// @param _role The role authorize to access the function
    modifier onlyRole(bytes32 _role) {
        require(accessControl.hasRole(_role, msg.sender), "Access refused");
        _;
    }

    function newDelivery(
        string memory _client,
        uint256 _price,
        uint256 _hubID
    ) external onlyRole(StarwingsDataLib.ADMIN_ROLE) {
        CommercialData memory data = _getCommercialData(
            _client,
            _price,
            _hubID
        );
        Delivery memory delivery = Delivery(DeliveryState.noInfo, data);
        _newDelivery(delivery);
    }

    function _getCommercialData(
        string memory _client,
        uint256 _price,
        uint256 _hubID
    ) internal pure returns (CommercialData memory) {
        return CommercialData(_client, _price, _hubID);
    }

    function _newDelivery(Delivery memory _delivery) internal {
        deliveryList.push(_delivery);
    }

    function getDelivery(uint256 _deliveryID)
        external
        view
        returns (Delivery memory)
    {
        require(_deliveryID < deliveryList.length, "Delivery does not exist");
        return deliveryList[_deliveryID];
    }

    function setDeliveryState(uint256 _deliveryID, DeliveryState _deliveryState)
        external
        returns (bool)
    {
        require(_deliveryID < deliveryList.length, "Delivery does not exist");
        deliveryList[_deliveryID].state = _deliveryState;
        return true;
    }
}
