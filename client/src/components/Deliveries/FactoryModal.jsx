import React, { useEffect, useState, useRef, useReducer } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";
import ConopsArtifact from "../../artifacts/contracts/ConopsManager.sol/ConopsManager.json";
import FactoryArtifact from "../../artifacts/contracts/DroneFlightFactory.sol/DroneFlightFactory.json";
import DroneDeliveryArtifact from "../../artifacts/contracts/DroneDelivery.sol/DroneDelivery.json";
import StarwingsDataLibArtifact from "../../artifacts/contracts/librairies/StarwingsDataLib.sol/StarwingsDataLib.json";
import { ethers } from "ethers";
import { buildCreate2Address, numberToUint256 } from "../../utils/create2helper";
import FlightPlanForm from "./FlightPlanForm";

const contractAddresses = require("../../contractAddresses.json");

const ConopsManagerAddress = contractAddresses.ConopsManager;
const FlightFactoryAddress = contractAddresses.DroneFlightFactory;

function FactoryModal({ state, show, onHide, deliveryId, StarwingsMasterSigner }) {
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

                if (StarwingsMasterSigner) {
                    const dronesList = await StarwingsMasterSigner.getDroneList();
                    setDrones(dronesList);
                }
                // console.log("signer:", state.signer);
                // const pilot = await StarwingsMasterProvider.getPilot(state.accounts[0]);
                // setPilot(pilot);
            }
        })();
    }, [state]);
    // console.log(StarwingsMasterSigner);
    // console.log(drones);
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
            const conopsL = await conopsManager.signer.viewAllConops();
            setConopsList(conopsL);
        } catch (error) {
            console.error(error);
        }
    };

    const submitFlight = async () => {
        // Prepare flightdata
        const flightData = {
            pilot: {
                index: 0,
                isDeleted: false,
                name: "",
                pilotAddress: "",
                flightAddresses: [],
            },
            drone: {
                index: 0,
                isDeleted: false,
                droneId: "",
                droneType: "",
                droneAddress: "",
                flightAddresses: [],
            },
            conopsId: 0,
            flightDatetime: 0,
            flightDuration: 0,
            depart: "",
            destination: "",
        };

        // Get Pilot
        const pilot = await StarwingsMasterSigner.getPilot(state.accounts[0]);
        flightData.pilot.index = pilot.index;
        flightData.pilot.isDeleted = pilot.isDeleted;
        flightData.pilot.name = pilot.name;
        flightData.pilot.pilotAddress = pilot.pilotAddress;
        flightData.pilot.flightAddresses = pilot.flightAddresses;

        // Get drone
        const drone = await StarwingsMasterSigner.getDrone(formData.drone);
        flightData.drone.index = drone.index;
        flightData.drone.isDeleted = drone.isDeleted;
        flightData.drone.droneId = drone.droneId;
        flightData.drone.droneType = drone.droneType;
        flightData.drone.droneAddress = drone.droneAddress;
        flightData.drone.flightAddresses = drone.flightAddresses;

        // Build byteCode for factory deploy
        const droneDeliveryIface = new ethers.utils.Interface(DroneDeliveryArtifact.abi);
        const salt = Date.now();

        // Create bytecode sent to FlightFactory.deploy function
        // We wants to call droneDelivery ctor, so we need :
        // address _deliveryManager,
        // string memory _deliveryId,
        // address _conopsManager,
        // address _accessControlAddress

        const dm = await StarwingsMasterSigner.getDeliveryManager();
        const cm = await StarwingsMasterSigner.getConopsManager();
        const ac = await StarwingsMasterSigner.getAccessControlAddress();

        // Generate hexCode from contract byteCode and ctor parameters
        const hexCode = ethers.utils.hexConcat([
            DroneDeliveryArtifact.bytecode,
            droneDeliveryIface.encodeDeploy([
                dm, // _deliveryManager
                formData.deliveryId, // _deliveryId
                cm, // _conopsManager
                ac, // _accessControlAddress
                StarwingsMasterSigner.address,
            ]),
        ]);

        // build deterministic contract address
        const computedAddr = buildCreate2Address(FlightFactoryAddress, numberToUint256(salt), hexCode);

        // generate byteCode for contract+ctor parameters
        const bytecode = ethers.utils.arrayify(hexCode);
        // Call factory to deploy contract
        const newDroneDeliveryAddr = await flightFactory.signer.deploy(bytecode, salt, {
            gasLimit: 9000000,
        });

        // wait for tx to be proceeded, and contract to be created
        await newDroneDeliveryAddr.wait();

        flightData.conopsId = ethers.BigNumber.from(formData.conopsId);
        flightData.flightDatetime = Date.parse(formData.flightDatetime) / 1000;
        flightData.flightDuration = ethers.BigNumber.from(formData.flightDuration);
        flightData.depart = formData.depart;
        flightData.destination = formData.destination;

        console.log(flightData);

        // Now initialize droneDelivery contract with data
        let droneDeliverySigner = new ethers.Contract(computedAddr, DroneDeliveryArtifact.abi, state.signer);
        const tx = await droneDeliverySigner.initDelivery(flightData);
        await tx;
        onHide();
    };

    const handleFormChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    //console.log(formData);

    return (
        <Modal show={show} onHide={onHide} keyboard={false} aria-labelledby="contained-modal-title-vcenter" size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Deliver (id:{deliveryId ? `${deliveryId.toString().substring(0, 20)}...` : "Unknown"})
                </Modal.Title>
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
