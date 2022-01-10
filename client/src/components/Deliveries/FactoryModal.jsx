import React, { useEffect, useState, useRef, useReducer } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";
import ConopsArtifact from "../../artifacts/contracts/ConopsManager.sol/ConopsManager.json";
import { ethers } from "ethers";
import FlightPlanForm from "./FlightPlanForm";

const ConopsManagerAddress = "0x51C5aba2e32C0bFcf4AeC2CA35c91C1FC47F142D";

const formReducer = (state, event) => {
    if (event.type === "reset") {
        return {};
    }

    return {
        ...state,
        [event.name]: event.value,
    };
};

function FactoryModal({ state, show, onHide }) {
    // const [formData, setFormData] = useReducer(formReducer, {});
    const [formData, setFormData] = useState({});
    const [conopsList, setConopsList] = useState([]);
    const [conops, setConops] = useState(-1);
    const conopsRef = useRef();
    const [conopsManager, setConopsManager] = useState({ provider: null, signer: null });

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

    useEffect(() => {
        setConops(-1);
        setFormData({});
    }, [show]);

    const selectConops = () => {
        setConops(conopsRef.current.value);
    };

    const getConops = async () => {
        try {
            const conopsL = await conopsManager.provider.viewAllConops();
            setConopsList(conopsL);
        } catch (error) {
            console.error(error);
        }
    };

    const submitFlight = async () => {};

    const handleFormChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };
    console.log(formData);
    return (
        <Modal show={show} onHide={onHide} keyboard={false} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title>Deliver</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {conops === -1 ? (
                    <div>
                        <h5>Choose Conops</h5>
                        <Form.Select name={"riskType"} ref={conopsRef}>
                            {conopsList.map((c, i) => (
                                <option value={i} key={i}>
                                    {c.name}
                                </option>
                            ))}
                        </Form.Select>
                        <Button variant="secondary" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={selectConops}>
                            {"Next >"}
                        </Button>
                    </div>
                ) : (
                    <div>
                        <h5>Fill flight plan</h5>
                        <FlightPlanForm setFormData={setFormData} handleFormChange={handleFormChange} />
                        <Button variant="secondary" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={submitFlight}>
                            Submit
                        </Button>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default FactoryModal;
