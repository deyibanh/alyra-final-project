import React, { useState, useEffect } from "react";
import { Button, Col, Form, FormControl, Badge, Modal, Row, Toast, ToastContainer } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "./PilotsContent.css";

function PilotsContent(props) {
    const StarwingsMasterSigner = props.StarwingsMasterSigner;
    const [pilotAddressList, setPilotAddressList] = useState([]);
    const [inputAddPilot, setInputAddPilot] = useState("");
    const [inputAddPilotName, setInputAddPilotName] = useState("");
    const [modalIsShown, setModalIsShown] = useState(false);
    const [pending, setPending] = useState(true);
    const [tooltip, setTooltip] = useState({ show: false, title: "Undefined", body: "None", variant: "" });

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

    const toggleTooltip = (show) =>
        setTooltip({ show: show, title: tooltip.title, body: tooltip.body, variant: tooltip.variant });
    const showTooltip = function (title, body, variant) {
        setTooltip({ show: true, title: title, body: body, variant: variant });
    };

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
        try {
            const tx = await StarwingsMasterSigner.addPilot(inputAddPilot, inputAddPilotName);
            //console.log(tx);
            showTooltip("Transaciton sent !", tx.hash, "success");
        } catch (error) {
            //console.log(error);
            showTooltip("Error", error?.data?.message, "danger");
        }

        setInputAddPilot("");
        setInputAddPilotName("");
        hideModal();
    }

    const getPilotList = async () => {
        setPending(true);
        toggleTooltip(false);
        try {
            const pilotAddressListResult = await StarwingsMasterSigner.getPilotList();
            setPilotAddressList(pilotAddressListResult);
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
            <ToastContainer className="p-3" position="bottom-end">
                <Toast show={tooltip.show} onClose={toggleTooltip} bg={tooltip.variant}>
                    <Toast.Header>
                        <strong className="me-auto">{tooltip.title}</strong>
                    </Toast.Header>
                    <Toast.Body>{tooltip.body}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}

export default PilotsContent;
