import React, { useEffect, useState, useRef, useReducer } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";
import ConopsArtifact from "../../artifacts/contracts/ConopsManager.sol/ConopsManager.json";
import FactoryArtifact from "../../artifacts/contracts/DroneFlightFactory.sol/DroneFlightFactory.json";
import { ethers } from "ethers";
import FlightPlanForm from "./FlightPlanForm";

const contractAddresses = require("../../contractAddresses.json");

const ConopsManagerAddress = contractAddresses.ConopsManager;
const FlightFactoryAddress = contractAddresses.DroneFlightFactory;

const formReducer = (state, event) => {
    if (event.type === "reset") {
        return {};
    }

    return {
        ...state,
        [event.name]: event.value,
    };
};

function FactoryModal({ state, show, onHide, deliveryId, StarwingsMasterProvider }) {
    // const [formData, setFormData] = useReducer(formReducer, {});
    const [formData, setFormData] = useState({});
    const [conopsList, setConopsList] = useState([]);
    const [conops, setConops] = useState(-1);
    const conopsRef = useRef();
    const [conopsManager, setConopsManager] = useState({ provider: null, signer: null });
    const [flightFactory, setFlightFactory] = useState({ provider: null, signer: null });
    const [drones, setDrones] = useState();
    // const [pilot, setPilot] = useState();

    useEffect(() => {
        (async () => {
            if (state.provider) {
                let provider = new ethers.Contract(ConopsManagerAddress, ConopsArtifact.abi, state.provider);
                let signer = new ethers.Contract(ConopsManagerAddress, ConopsArtifact.abi, state.signer);
                setConopsManager({ provider, signer });

                provider = new ethers.Contract(FlightFactoryAddress, FactoryArtifact.abi, state.provider);
                signer = new ethers.Contract(FlightFactoryAddress, FactoryArtifact.abi, state.signer);
                setFlightFactory({ provider, signer });

                const dronesList = await StarwingsMasterProvider.getDroneList();
                console.log("DRONELIST:", dronesList);
                setDrones(dronesList);
                // console.log("signer:", state.signer);
                // const pilot = await StarwingsMasterProvider.getPilot(state.accounts[0]);
                // setPilot(pilot);
            }
        })();
    }, [state]);

    useEffect(() => {
        if (conopsManager.provider) {
            getConops();
        }
    }, [conopsManager]);

    useEffect(() => {
        setConops(-1);
        if (show) {
            // const data = { deliveryId: deliveryId, pilot: pilot };
            const data = { deliveryId: deliveryId };
            updateFormData(data);
        } else {
            setFormData({});
        }
    }, [show]);

    const updateFormData = (data) => {
        setFormData({ ...formData, ...data });
    };

    const selectConops = () => {
        if (conopsRef.current.value != "noConops") {
            setConops(conopsRef.current.value);
        }
    };

    const getConops = async () => {
        try {
            const conopsL = await conopsManager.provider.viewAllConops();
            setConopsList(conopsL);
        } catch (error) {
            console.error(error);
        }
    };

    const submitFlight = async () => {
        const tx = await flightFactory.signer.newDroneDelivery(
            ethers.BigNumber.from(formData.deliveryId),
            formData.drone,
            ethers.BigNumber.from(formData.conopsId),
            Date.parse(formData.flightDatetime) / 1000,
            ethers.BigNumber.from(formData.flightDuration),
            formData.depart,
            formData.destination
        );
        await tx;
        onHide();
    };

    const handleFormChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    console.log(formData);

    return (
        <Modal show={show} onHide={onHide} keyboard={false} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title>Deliver (id:{deliveryId})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {conops === -1 ? (
                    <div>
                        <h5>Choose Conops</h5>
                        <Form.Select name={"conopsId"} ref={conopsRef} onChange={handleFormChange}>
                            <option value="noConops">Choose Conops</option>
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
                ) : drones ? (
                    <div>
                        <h5>Fill flight plan</h5>
                        <div>Conops id: {conops}</div>
                        <hr />
                        <FlightPlanForm setFormData={setFormData} handleFormChange={handleFormChange} drones={drones} />
                        <Button variant="secondary" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={submitFlight}>
                            Submit
                        </Button>
                    </div>
                ) : (
                    <div>...loading drones</div>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default FactoryModal;
