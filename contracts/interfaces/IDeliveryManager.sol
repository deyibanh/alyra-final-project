//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IDeliveryManager {
    enum DeliveryState {
        noInfo,
        registered,
        atHub,
        inDelivery,
        arrived,
        delivered
    }

    struct CommercialData {
        string client;
        uint256 price;
        uint256 hubID;
    }

    struct Delivery {
        DeliveryState state;
        CommercialData commercialData;
    }

    function newDelivery(
        string memory _client,
        uint256 _price,
        uint256 _hubID
    ) external;

    function getDelivery(uint256 _deliveryID)
        external
        view
        returns (Delivery memory);

    function setDeliveryState(uint256 _deliveryID, DeliveryState _deliveryState)
        external
        returns (bool);
}
