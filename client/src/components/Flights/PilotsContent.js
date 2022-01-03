import React, { useState, useEffect } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";
import "./PilotsContent.css";

function PilotsContent(props) {
    const state = props.state;
    const StarwingsMasterProvider = props.StarwingsMasterProvider;
    const StarwingsMasterSigner = props.StarwingsMasterSigner;
    const [pilotAddressList, setPilotAddressList] = useState([]);
    const [inputAddPilot, setInputAddPilot] = useState("");
    const [modalIsShown, setModalIsShown] = useState(false);

    useEffect(() => {
        (async () => {
            if (StarwingsMasterProvider) {
                try {
                    const pilotAddressListResult = await StarwingsMasterProvider.getPilotAddressList();
                    setPilotAddressList(pilotAddressListResult);
                    console.log(pilotAddressList);
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    }, [StarwingsMasterProvider]);

    function onChangeInputAddPilot(event) {
        event.preventDefault();
        setInputAddPilot(event.target.value);
    }

    function hideModal() {
        setModalIsShown(false);
    }

    function showModal() {
        setModalIsShown(true);
    }

    async function onSubmitAddPilot(event) {
        event.preventDefault();
        // await StarwingsMasterSigner.addPilot(inputAddPilot);
        setInputAddPilot("");
    }

    return (
        <div className="PilotsContent">
            <Row>
                <Col>
                    <Button variant="primary" onClick={showModal}>
                        + Add Pilot
                    </Button>
                </Col>
            </Row>
            <Row style={{ marginTop: "30px" }}>
                <Col>
                    {pilotAddressList && pilotAddressList.length > 0 ? (
                        <span>There is pilots.</span>
                    ) : (
                        <span>There is no pilots yet.</span>
                    )}
                </Col>
            </Row>

            <Modal
                show={modalIsShown}
                onHide={hideModal}
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Pilot</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Pilot Address</Form.Label>
                    <FormControl
                        placeholder="0x..."
                        aria-label="0x..."
                        value={inputAddPilot}
                        onChange={onChangeInputAddPilot}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModal}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        disabled={StarwingsMasterSigner && inputAddPilot === ""}
                        onClick={onSubmitAddPilot}
                    >
                        Add
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PilotsContent;
