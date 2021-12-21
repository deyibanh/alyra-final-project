//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./interfaces/IDeliveryMaster.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 *   @title Delivery Master
 *   @author Damien
 *  @notice This contract manage all the deliveries.
 */
contract DeliveryMaster is IDeliveryMaster {
    Delivery[] private deliveryList;
    IAccessControl private accessControl;
    CommercialData private commercialData;

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

    function newDelivery(
        string memory _client,
        uint256 _price,
        uint256 _hubID
    ) external {
        CommercialData memory data = _getCommercialData(_client, _price, _hubID);
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
