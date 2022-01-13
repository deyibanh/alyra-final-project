import React, { useEffect, useReducer, useState, useLayoutEffect } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";

function DeliveryForm({ formChange, setFormData }) {
    return (
        <div className="delivery-form">
            <Form.Label htmlFor="supplierOrderId">Supplier Order ID</Form.Label>
            <Form.Control name="orderId" id="supplierOrderId" type="text" rows={3} onChange={formChange} />

            <Form.Label htmlFor="fromName">From :</Form.Label>
            <Form.Control name="from" id="fromName" type="text" rows={3} onChange={formChange} />

            <Form.Label htmlFor="fromAddr">From (account) :</Form.Label>
            <Form.Control
                name="fromAccount"
                id="fromAddr"
                type="text"
                placeholder="0x0..."
                rows={3}
                onChange={formChange}
            />

            <Form.Label htmlFor="toName">To :</Form.Label>
            <Form.Control name="to" id="toName" type="text" rows={3} onChange={formChange} />

            <Form.Label htmlFor="toAddr">To (account) :</Form.Label>
            <Form.Control
                name="toAccount"
                id="toAddr"
                type="text"
                placeholder="0x0..."
                rows={3}
                onChange={formChange}
            />

            <Form.Label htmlFor="fromHubId">Depart Hub Id :</Form.Label>
            <Form.Control name="fromHubId" id="fromHubId" type="text" rows={3} onChange={formChange} />

            <Form.Label htmlFor="toHubId">Destination Hub Id :</Form.Label>
            <Form.Control name="toHubId" id="toHubId" type="text" rows={3} onChange={formChange} />
        </div>
    );
}
export default DeliveryForm;
