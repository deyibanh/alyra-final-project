import React, { useState, useEffect, useReducer } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";

import ConopsArtifact from "../../artifacts/contracts/ConopsManager.sol/ConopsManager.json";
import FactoryModal from "./FactoryModal";

const FlightFactoryAddress = "0x2A1530D9645B6C5ae0Bd8AC2d847C41c891239f5";

function TestDeliveriesContent({ state }) {
    const [factoryModalIsShown, setFactoryModalIsShown] = useState(false);
    
    const hideModal = () => {
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
            <FactoryModal show={factoryModalIsShown} onHide={hideModal} state={state} />
        </div>
    );
}

export default TestDeliveriesContent;
