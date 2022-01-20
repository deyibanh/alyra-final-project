//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IDeliveryManager.sol";
import { StarwingsDataLib } from "./librairies/StarwingsDataLib.sol";

 /**
 * @title The DeliveryManager contract.
 *
 * @author Starwings
 *
 * @notice This contract manage all the deliveries.
 */
contract DeliveryManager is IDeliveryManager {
    using Strings for uint256;

    /**
     * @dev A map of a delivery ID and the index of the delivery list.
     */
    mapping(string => uint256) private deliveriesIndex;

    /**
     * @dev A list of Delivery.
     */
    Delivery[] private deliveries;

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
     * @inheritdoc IDeliveryManager
     */
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
        // Generate pseudo random deliveryID.
        _delivery.deliveryId = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp, // solhint-disable-line not-rely-on-time
                    _delivery.fromAddr,
                    _delivery.toAddr,
                    _delivery.supplierOrderId
                )
            )
        ).toHexString();

        deliveries.push(_delivery);
        deliveriesIndex[_delivery.deliveryId] = deliveries.length - 1;

        emit DeliveryCreated(_delivery.deliveryId);

        return _delivery.deliveryId;
    }

    /**
     * @inheritdoc IDeliveryManager
     */
    function getDelivery(string memory _deliveryId)
        external
        view
        returns (Delivery memory)
    {
        uint256 tabIndex = deliveriesIndex[_deliveryId];

        require(tabIndex < deliveries.length, "Out of size index");
        require(
            bytes(deliveries[tabIndex].deliveryId).length > 0,
            "Delivery does not exist"
        );

        return deliveries[tabIndex];
    }

    /**
     * @inheritdoc IDeliveryManager
     */
    function setDeliveryState(string memory _deliveryId, DeliveryState _deliveryState) external {
        uint256 tabIndex = deliveriesIndex[_deliveryId];

        require(tabIndex < deliveries.length, "Out of size index");
        require(
            bytes(deliveries[tabIndex].deliveryId).length > 0,
            "Delivery does not exist"
        );

        DeliveryState oldState = deliveries[tabIndex].state;
        deliveries[tabIndex].state = _deliveryState;

        emit DeliveryStatusUpdated(
            deliveries[tabIndex].deliveryId,
            oldState,
            _deliveryState
        );
    }

    /**
     * @inheritdoc IDeliveryManager
     */
    function getAllDeliveries() external view returns (Delivery[] memory) {
        return deliveries;
    }
}
