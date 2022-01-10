import React, { useState, useEffect, useReducer } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";

import ConopsArtifact from "../../artifacts/contracts/ConopsManager.sol/ConopsManager.json";
import FactoryModal from "./FactoryModal";

const FlightFactoryAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

function TestDeliveriesContent({ state }) {
    const [factoryModalIsShown, setFactoryModalIsShown] = useState(false);

    const hideFactoryModal = () => {
        setFactoryModalIsShown(false);
    };

    const showFactoryModal = () => {
        setFactoryModalIsShown(true);
    };

    return (
        <div className="DeliverieContent">
            <Row className="justify-content-end">
                <Col sm="auto">
                    <Button variant="primary" onClick={showFactoryModal}>
                        + Deliver (id: 0)
                    </Button>
                </Col>
            </Row>
            <FactoryModal show={factoryModalIsShown} onHide={hideFactoryModal} state={state} />
        </div>
    );
}

export default TestDeliveriesContent;
