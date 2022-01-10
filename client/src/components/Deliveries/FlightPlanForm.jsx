import React, { useEffect, useState } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";

function FlightPlanForm({ setFormData, handleFormChange }) {

    return (
        <div className="flightPlan-form">
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Drone :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="0x..." onChange={handleFormChange} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Pilot :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="0x..." onChange={handleFormChange} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Start time:
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="timestamp" onChange={handleFormChange} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Duration :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="minutes" onChange={handleFormChange} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Pilote Name :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="..." onChange={handleFormChange} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Drone Type :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="..." onChange={handleFormChange} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Drone Id :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="id" onChange={handleFormChange} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    start location :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="..." onChange={handleFormChange} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    end location :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="..." onChange={handleFormChange} />
                </Col>
            </Form.Group>
        </div>
    );
}

export default FlightPlanForm;
