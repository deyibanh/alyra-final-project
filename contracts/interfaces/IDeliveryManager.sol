//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/**
 * @title The IDeliveryManager interface.
 *
 * @author Starwings
 *
 * @notice This is the IDeliveryManager interface that manages deliveries.
 */
interface IDeliveryManager {
    /**
     * @dev DeliveryState enum.
     */
    enum DeliveryState {
        noInfo,
        registered,
        atHub,
        planned,
        inDelivery,
        arrived,
        delivered
    }

    /**
     * @dev Delivery struct.
     * The delivery ID is self generated.
     * The order ID is provided by supplier.
     */
    struct Delivery {
        string deliveryId;
        string supplierOrderId;
        string from;
        string to;
        address fromAddr;
        address toAddr;
        uint16 fromHubId;
        uint16 toHubId;
        DeliveryState state;
    }

    /**
     * @notice Event emitted when the delivery is created.
     *
     * @param deliveryId Index of the delivery.
     */
    event DeliveryCreated(string deliveryId);

    /**
     * @notice Event emitted when the delivery status is updated.
     *
     * @param deliveryId Index of the delivery.
     * @param oldStatus The delivery old status.
     * @param newStatus The delivery new status.
     */
    event DeliveryStatusUpdated(
        string deliveryId,
        DeliveryState oldStatus,
        DeliveryState newStatus
    );

    /**
     * @notice Creates a new delivery.
     *
     * @param _delivery A struct containing delivery information, all properties are required expect deliveryId.
     *
     * @return The delivery ID.
     */
    function newDelivery(Delivery memory _delivery) external returns (string memory);

    /**
     * @notice Get delivery by ID.
     *
     * @param _deliveryId The delivery ID.
     *
     * @return The Delivery struct.
     */
    function getDelivery(string memory _deliveryId) external view returns (Delivery memory);

    /**
     * @notice Update the delivery state.
     *
     * @param _deliveryId The delivery ID to update.
     * @param _deliveryState The new state, using DeliveryState enum.
     */
    function setDeliveryState(string memory _deliveryId, DeliveryState _deliveryState) external;

    /**
     * @notice Get all deliveries ID to be able to query the map after.
     *
     * @return The Delivery list.
     */
    function getAllDeliveries() external view returns (Delivery[] memory);
}
