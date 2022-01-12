import React, { useState, useEffect } from "react";
import { Button, Col, Form, FormControl, Badge, Modal, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "./PilotsContent.css";

function PilotsContent(props) {
    const StarwingsMasterSigner = props.StarwingsMasterSigner;
    const [pilotAddressList, setPilotAddressList] = useState([]);
    const [inputAddPilot, setInputAddPilot] = useState("");
    const [inputAddPilotName, setInputAddPilotName] = useState("");
    const [modalIsShown, setModalIsShown] = useState(false);
    const [pending, setPending] = useState(true);

    useEffect(() => {
        if (StarwingsMasterSigner) {
            getPilotList();

            StarwingsMasterSigner.on("PilotAdded", (pilotAddress) => {
                getPilotList();
            });

            StarwingsMasterSigner.on("PilotDeleted", (pilotAddress) => {
                getPilotList();
            });
        }
    }, [StarwingsMasterSigner]);

    function onChangeInputAddPilot(event) {
        event.preventDefault();
        setInputAddPilot(event.target.value);
    }

    function onChangeInputAddPilotName(event) {
        event.preventDefault();
        setInputAddPilotName(event.target.value);
    }

    function hideModal() {
        setModalIsShown(false);
    }

    function showModal() {
        setModalIsShown(true);
    }

    async function onSubmitAddPilot(event) {
        event.preventDefault();
        await StarwingsMasterSigner.addPilot(inputAddPilot, inputAddPilotName);
        setInputAddPilot("");
        setInputAddPilotName("");
        hideModal();
    }

    const getPilotList = async () => {
        setPending(true);
        try {
            const pilotAddressListResult = await StarwingsMasterSigner.getPilotList();
            setPilotAddressList(pilotAddressListResult);
            //console.log(pilotAddressList);
        } catch (error) {
            console.error(error);
        }

        setPending(false);
    };

    const handleDeletePilotClick = async (state) => {
        console.log(state.target.id);
        await StarwingsMasterSigner.deletePilot(state.target.id);
    };

    const columns = [
        {
            name: "Index",
            selector: (row) => row.index.toString(),
        },
        {
            name: "Deleted",
            selector: (row) => {
                return row.isDeleted ? <Badge bg="danger">true</Badge> : <Badge bg="success">false</Badge>;
            },
        },
        {
            name: "Name",
            selector: (row) => row.name,
        },
        {
            name: "addr",
            selector: (row) => row.pilotAddress,
        },
        {
            cell: (row) =>
                row.isDeleted ? (
                    <Button onClick={handleDeletePilotClick} id={row.pilotAddress} variant="danger" size="sm" disabled>
                        The end!
                    </Button>
                ) : (
                    <Button onClick={handleDeletePilotClick} id={row.pilotAddress} variant="danger" size="sm">
                        Delete
                    </Button>
                ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <div className="PilotsContent">
            <Row>
                <Col
                    sm="auto"
                    onClick={async () => {
                        await getPilotList();
                    }}
                >
                    <Button variant="primary">Refresh</Button>
                </Col>
                <Col>
                    <Button variant="primary" onClick={showModal}>
                        + Add Pilot
                    </Button>
                </Col>
            </Row>
            <Row style={{ marginTop: "30px" }}>
                <Col>
                    {/* {pilotAddressList && pilotAddressList.length > 0 ? (
                        <span>There is pilots.</span>
                    ) : (
                        <span>There is no pilots yet.</span>
                    )} */}
                    <DataTable columns={columns} data={pilotAddressList} progressPending={pending} />
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
                    <Form.Label>Pilot Name</Form.Label>
                    <FormControl value={inputAddPilotName} onChange={onChangeInputAddPilotName} />
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
