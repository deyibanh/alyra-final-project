import React, { useEffect, useState } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";

function AirRiskForm({ setAirRisks, id, children }) {
    const handleChange = (e) => {
        const values = { ...children, [e.target.name]: e.target.value };
        setAirRisks({ type: "UPDATE_ITEM", airRisk: values, id: id });
    };

    return (
        <div className="airRisk-form">
            <Form.Group as={Row} className="mb-3" controlId="name">
                <Form.Label column sm={2}>
                    Name:
                </Form.Label>
                <Col sm={10}>
                    <FormControl
                        name={"name"}
                        type="text"
                        placeholder="..."
                        onChange={handleChange}
                        value={children.name || ""}
                    />
                </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="type">
                <Form.Label column sm={2}>
                    Type:
                </Form.Label>
                <Col sm={10}>
                    <Form.Select name={"riskType"} onChange={handleChange} value={children.riskType || ""}>
                        <option value="">Choose Type</option>
                        <option value="0">Aerodrome</option>
                        <option value="1">CHU</option>
                        <option value="2">MilitaryBase</option>
                    </Form.Select>
                </Col>
            </Form.Group>
        </div>
    );
}

export default AirRiskForm;
