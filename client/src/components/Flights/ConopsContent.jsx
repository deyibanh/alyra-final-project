import React, { useState, useEffect, useReducer } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row, Card } from "react-bootstrap";
import { ethers } from "ethers";
import ConopsArtifact from "../../artifacts/contracts/ConopsManager.sol/ConopsManager.json";
import ConopsForm from "./ConopsForm";

const ConopsManagerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const formReducer = (state, event) => {
    if (event.type === "reset") {
        return {};
    }

    return {
        ...state,
        [event.name]: event.value,
    };
};

function ConopsContent({ state }) {
    const [conops, setConops] = useState([]);
    const [conopsManager, setConopsManager] = useState({});
    const [modalIsShown, setModalIsShown] = useState(false);
    const [formData, setFormData] = useReducer(formReducer, {});

    useEffect(() => {
        if (state.provider) {
            const provider = new ethers.Contract(ConopsManagerAddress, ConopsArtifact.abi, state.provider);
            const signer = new ethers.Contract(ConopsManagerAddress, ConopsArtifact.abi, state.signer);
            setConopsManager({ provider, signer });
        }
    }, [state]);

    useEffect(() => {
        if (conopsManager.provider) {
            getConops();
        }
    }, [conopsManager]);

    const hideModal = () => {
        setModalIsShown(false);
    };

    const showModal = () => {
        setFormData({ type: "reset" });
        setModalIsShown(true);
    };

    const getConops = async () => {
        try {
            const conopsList = await conopsManager.provider.viewAllConops();
            setConops(conopsList);
            console.log(conopsList);
        } catch (error) {
            console.error(error);
        }
    };

    const submitConops = async () => {
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
        hideModal();
    };

    const handleFormChange = (event) => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
            type: event.type,
        });
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
            <Row md={5} className="g-4 mt-2">
                {conops.map((c) => (
                    <Col key={c.name}>
                        <Card bg={c.activated ? "light" : "secondary"} text={c.activated ? "dark" : "white"}>
                            <Card.Body>
                                <Card.Title className="text-center">{c.name}</Card.Title>
                                {/* <Card.Subtitle className="mb-2 text-muted">{c.}</Card.Subtitle> */}
                                <Card.Text>GRC: {c.grc}</Card.Text>
                                <Card.Text>ARC: {c.arc}</Card.Text>
                                <Card.Link href="#">More Info</Card.Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
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
        </div>
    );
}

export default ConopsContent;
