import React, { useState, useEffect, useReducer } from "react";
import { Button, Col, Modal, Row, Toast, ToastContainer } from "react-bootstrap";
import { ethers } from "ethers";
import ConopsArtifact from "../../artifacts/contracts/ConopsManager.sol/ConopsManager.json";
import ConopsForm from "./ConopsForm";
import ConopsCard from "./ConopsCard";
import ConopsDetail from "./ConopsDetail";

const contractAddresses = require("../../contractAddresses.json");

const ConopsManagerAddress = contractAddresses.ConopsManager;

const formReducer = (state, event) => {
    if (event.type === "reset") {
        return {};
    }

    return {
        ...state,
        [event.name]: event.value,
    };
};

const airRistType = { 0: "Aerodrome", 1: "CHU", 2: "Military Base" };

function ConopsContent({ state }) {
    const [conops, setConops] = useState([]);
    const [conopsManager, setConopsManager] = useState({});
    const [modalIsShown, setModalIsShown] = useState(false);
    const [formData, setFormData] = useReducer(formReducer, {});
    const [viewDetails, setViewDetails] = useState(-1);
    const [cardGroupSize, setCardGroupSize] = useState(5);
    const [tooltip, setTooltip] = useState({ show: false, title: "Undefined", body: "None", variant: "" });

    useEffect(() => {
        if (state.provider) {
            const provider = new ethers.Contract(ConopsManagerAddress, ConopsArtifact.abi, state.provider);
            const signer = new ethers.Contract(ConopsManagerAddress, ConopsArtifact.abi, state.signer);
            setConopsManager({ provider, signer });
        }
    }, [state]);

    useEffect(() => {
        if (conopsManager.signer) {
            conopsManager.provider.on("ConopsCreated", (conopsId, name) => {
                getConops();
            });
            getConops();
        }
    }, [conopsManager]);

    const toggleTooltip = (show) =>
        setTooltip({ show: show, title: tooltip.title, body: tooltip.body, variant: tooltip.variant });
    const showTooltip = function (title, body, variant) {
        setTooltip({ show: true, title: title, body: body, variant: variant });
    };

    const hideModal = () => {
        setModalIsShown(false);
    };

    const showModal = () => {
        setFormData({ type: "reset" });
        setModalIsShown(true);
    };

    const getConops = async () => {
        try {
            toggleTooltip(false);
            const conopsList = await conopsManager.signer.viewAllConops();
            setConops(conopsList);
        } catch (error) {
            console.error(error);
        }
    };

    const submitConops = async () => {
        try {
            const tx = await conopsManager.signer.addConops(
                formData.name,
                formData.start,
                formData.end,
                formData.crossroad,
                formData.exclusion,
                formData.airRisks,
                Number(formData.GRC),
                Number(formData.ARC)
            );
            await tx;
            showTooltip("Transaciton sent !", tx.hash, "success");
        } catch (error) {
            showTooltip("Error", error?.data?.message, "danger");
        }

        hideModal();
    };

    const handleFormChange = (event) => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
            type: event.type,
        });
    };

    const changeVisibility = (i) => {
        i === -1 ? setCardGroupSize(5) : setCardGroupSize(1);
        setViewDetails(i);
    };

    return (
        <div className="ConopsContent">
            {conops.length === 0 && <div>No Conops at the moment</div>}
            <Row className="justify-content-end">
                <Col sm="auto">
                    <Button variant="primary" onClick={showModal}>
                        + Add Conops
                    </Button>
                </Col>
            </Row>
            <Row md={cardGroupSize} className="g-2 mt-2">
                {conops.map((c, i) =>
                    viewDetails === -1 ? (
                        <Col key={c.name}>
                            <ConopsCard conops={c} changeVisibility={changeVisibility} id={i} />
                        </Col>
                    ) : (
                        viewDetails === i && (
                            <Col key={c.name}>
                                <ConopsDetail
                                    conops={c}
                                    changeVisibility={changeVisibility}
                                    airRistType={airRistType}
                                />
                            </Col>
                        )
                    )
                )}
            </Row>
            <Modal
                show={modalIsShown}
                onHide={hideModal}
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add CONOPS</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ConopsForm formChange={handleFormChange} setFormData={setFormData} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submitConops}>
                        Submit
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

export default ConopsContent;
