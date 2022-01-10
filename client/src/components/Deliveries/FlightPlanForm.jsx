import React, { useRef, useState } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";

function FlightPlanForm({ setFormData, handleFormChange, drones }) {
    const droneRef = useRef();
    const startTime = useRef();
    const duration = useRef();
    const startLocation = useRef();
    const endLocation = useRef();

    return (
        <div className="flightPlan-form">
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Drone :
                </Form.Label>
                <Col sm={9}>
                    <Form.Select name={"drone"} ref={droneRef} onChange={handleFormChange}>
                        <option value="noDrone">Choose Drone</option>
                        {drones.map((d, i) => (
                            <option value={d.droneAddress} key={i}>
                                {d.droneId} - {d.droneType}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Form.Group>
            {/* <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Pilot :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="0x..." onChange={handleFormChange} />
                </Col>
            </Form.Group> */}
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Start time:
                </Form.Label>
                <Col sm={9}>
                    <FormControl
                        name="flightDatetime"
                        type="datetime-local"
                        placeholder="timestamp"
                        onChange={handleFormChange}
                        ref={startTime}
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Duration :
                </Form.Label>
                <Col sm={9}>
                    <FormControl
                        name="flightDuration"
                        type="number"
                        placeholder="minutes"
                        onChange={handleFormChange}
                        ref={duration}
                    />
                </Col>
            </Form.Group>
            {/* <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Pilote Name :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="..." onChange={handleFormChange} />
                </Col>
            </Form.Group> */}
            {/* <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Drone Type :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="..." onChange={handleFormChange} />
                </Col>
            </Form.Group> */}
            {/* <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    Drone Id :
                </Form.Label>
                <Col sm={9}>
                    <FormControl name="name" type="text" placeholder="id" onChange={handleFormChange} />
                </Col>
            </Form.Group> */}
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    start location :
                </Form.Label>
                <Col sm={9}>
                    <FormControl
                        name="depart"
                        type="text"
                        placeholder="..."
                        onChange={handleFormChange}
                        ref={startLocation}
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={3}>
                    end location :
                </Form.Label>
                <Col sm={9}>
                    <FormControl
                        name="destination"
                        type="text"
                        placeholder="..."
                        onChange={handleFormChange}
                        ref={endLocation}
                    />
                </Col>
            </Form.Group>
        </div>
    );
}

export default FlightPlanForm;
