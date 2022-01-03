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

    // struct CommercialData {
    //     string client;
    //     uint256 price;
    //     uint256 hubID;
    // }

    struct Delivery {
        string deliveryId; // DeliveryId, self generated
        string supplierOrderId; // OrderId provided by supplier
        DeliveryState state;
        string from;
        address fromAddr;
        string to;
        address toAddr;
        uint16 fromHubId;
        uint16 toHubId;
    }

    event DeliveryCreated(string deliveryId);
    event DeliveryStatusUpdated(
        string deliveryId,
        DeliveryState oldStatus,
        DeliveryState newStatus
    );

    function newDelivery(Delivery memory _delivery)
        external
        returns (string memory);

    function getDelivery(string memory _deliveryId)
        external
        view
        returns (Delivery memory);

    function setDeliveryState(
        string memory _deliveryId,
        DeliveryState _deliveryState
    ) external;

    function getAllDeliveries() external view returns (Delivery[] memory);
}
