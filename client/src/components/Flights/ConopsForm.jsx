import React, { useEffect, useReducer, useState, useLayoutEffect } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";
import AirRiskForm from "./AirRiskForm";

const reducer = (state, action) => {
    switch (action.type) {
        case "NEW_ITEM":
            return [...state, { name: null, riskType: null }];
        case "UPDATE_ITEM":
            return state.map((item, index) => {
                if (index === action.id) {
                    const updatedItem = {
                        ...item,
                        name: action.airRisk.name,
                        riskType: action.airRisk.riskType,
                    };

                    return updatedItem;
                }

                return item;
            });
        case "REMOVE_ITEM":
            console.log(action.id);
            return state.filter((item, index) => index !== action.id);
        default:
            throw new Error();
    }
};

function ConopsForm({ formChange, setFormData }) {
    const [airRisks, setAirRisks] = useReducer(reducer, []);

    const addRisk = () => {
        setAirRisks({ type: "NEW_ITEM" });
    };

    const removeRisk = (id) => {
        setAirRisks({ type: "REMOVE_ITEM", id: id });
    };

    useLayoutEffect(() => {
        setFormData({
            name: "airRisks",
            value: airRisks,
        });
    }, [airRisks]);

    console.log(airRisks);

    return (
        <div className="conops-form">
            <Form.Group as={Row} className="mb-3" controlId="conops-name">
                <Form.Label column sm={2}>
                    Name:
                </Form.Label>
                <Col sm={10}>
                    <FormControl name="name" type="text" placeholder="..." onChange={formChange} />
                </Col>
            </Form.Group>

            <hr></hr>
            <h5 className="text-center">Ground Security Analysis:</h5>
            <Form.Label htmlFor="starting-point">Start point security</Form.Label>
            <Form.Control name="start" id="starting-point" as="textarea" rows={3} onChange={formChange} />
            <Form.Label htmlFor="end-point">End point security:</Form.Label>
            <Form.Control name="end" id="end-point" as="textarea" rows={3} onChange={formChange} />
            <Form.Label htmlFor="crossroad">Crossroad security:</Form.Label>
            <Form.Control name="crossroad" id="crossroad" as="textarea" rows={3} onChange={formChange} />
            <Form.Label htmlFor="exclusion-zone">Exclusion zone security:</Form.Label>
            <Form.Control name="exclusion" id="exclusion-zone" as="textarea" rows={3} onChange={formChange} />
            <Form.Group as={Row} className="mb-3" controlId="GRC">
                <Form.Label column sm="auto">
                    Ground Risk Classification:
                </Form.Label>
                <Col sm={2}>
                    <FormControl name="GRC" type="text" placeholder="00" onChange={formChange} />
                </Col>
            </Form.Group>

            <hr></hr>
            <h5 className="text-center">Air Security Analysis</h5>
            {airRisks.map((r, i) => (
                <Row key={i} className="justify-content-end align-items-center">
                    <h6>
                        <u>Air Risk {i} :</u>
                    </h6>
                    <Col sm={1}>
                        <Button variant="danger" size="sm" onClick={() => removeRisk(i)}>
                            -
                        </Button>
                    </Col>
                    <Col sm={11}>
                        <AirRiskForm id={i} setAirRisks={setAirRisks}>
                            {r}
                        </AirRiskForm>
                    </Col>
                </Row>
            ))}
            <Button variant="primary" size="sm" className="mx-1" onClick={addRisk}>
                + Add
            </Button>
            <Form.Group as={Row} className="mb-3" controlId="ARC">
                <Form.Label column sm="auto">
                    Air Risk Classification:
                </Form.Label>
                <Col sm={2}>
                    <FormControl name="ARC" type="text" placeholder="00" onChange={formChange} />
                </Col>
            </Form.Group>
        </div>
    );
}
export default ConopsForm;
