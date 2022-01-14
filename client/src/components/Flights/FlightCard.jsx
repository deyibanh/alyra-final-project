import React, { useEffect, useRef, useState } from "react";
import {
    Offcanvas,
    Row,
    Card,
    Col,
    Image,
    Stack,
    OverlayTrigger,
    Tooltip,
    Popover,
    ListGroup,
    Button,
    Form,
} from "react-bootstrap";
import deliveredLogo from "../../img/delivered.png";
import pickedupLogo from "../../img/drone.png";
import engineLogo from "../../img/engine.png";
import batteryLogo from "../../img/battery.png";
import telecomLogo from "../../img/telecom.png";
import droneLogo from "../../img/drone-solo.png";
import pilotLogo from "../../img/pilot.png";
import cautionLogo from "../../img/caution.png";
import FlightState from "./FlightState";
import { ethers } from "ethers";
import DroneDeliveryArtifact from "../../artifacts/contracts/DroneDelivery.sol/DroneDelivery.json";

const airRiskType = {
    0: "Aerodrome",
    1: "CHU",
    2: "Military Base",
};

const flightState = {
    0: "Pre flight",
    1: "Canceled",
    2: "In flight",
    3: "Paused",
    4: "Aborted",
    5: "Ended",
};

function FlightCard({ flight, changeVisibility, id, state }) {
    const [flightInfo, setFlightInfo] = useState();
    const [show, setShow] = useState(false);
    const piloFlightStateRef = useRef();
    const [droneDelivery, setDroneDelivery] = useState();

    useEffect(() => {
        if (state.provider) {
            let address = flight[flight.length - 1];
            const provider = new ethers.Contract(address, DroneDeliveryArtifact.abi, state.provider);
            const signer = new ethers.Contract(address, DroneDeliveryArtifact.abi, state.signer);
            setDroneDelivery({ provider, signer });
        }
    }, [state]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const submitState = async () => {
        // const tx = await droneDelivery.signer.changeFlightStatus(piloFlightStateRef.current.value);
        // await tx;
    };

    return (
        <>
            <Card>
                <Card.Body>
                    <Card.Title className="text-start d-flex align-items-center">
                        <Col sm={3}>
                            <Stack gap={2} direction="horizontal">
                                {flight[2] ? (
                                    <OverlayTrigger overlay={<Tooltip>Parcel delivered</Tooltip>}>
                                        <Image src={deliveredLogo} alt="" fluid style={{ height: "1.7rem" }} />
                                    </OverlayTrigger>
                                ) : (
                                    flight[1] && (
                                        <OverlayTrigger overlay={<Tooltip>in delivery</Tooltip>}>
                                            <Image src={pickedupLogo} alt="" fluid style={{ height: "1.7rem" }} />
                                        </OverlayTrigger>
                                    )
                                )}
                                {flight[0].substring(0, 8)}...
                            </Stack>
                        </Col>
                        <Col sm={4}>
                            <Stack gap={2} direction="horizontal">
                                <h6>PreFlight Checks:</h6>
                                {flight[9] && <Image src={engineLogo} alt="" fluid style={{ height: "1.2rem" }} />}
                                {flight[10] && <Image src={batteryLogo} alt="" fluid style={{ height: "1.2rem" }} />}
                                {flight[11] && <Image src={telecomLogo} alt="" fluid style={{ height: "1.2rem" }} />}
                            </Stack>
                        </Col>
                        <Col sm={4}>
                            <Stack gap={2} direction="horizontal">
                                <h6>PostFlight Checks:</h6>
                                {flight[12] && <Image src={engineLogo} alt="" fluid style={{ height: "1.2rem" }} />}
                                {flight[13] && <Image src={batteryLogo} alt="" fluid style={{ height: "1.2rem" }} />}
                                {flight[14] && <Image src={telecomLogo} alt="" fluid style={{ height: "1.2rem" }} />}
                            </Stack>
                        </Col>
                        <Col sm={1}>
                            <Stack gap={2} direction="horizontal">
                                {flight[7].length > 0 && (
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip>
                                                {console.log(flight[7])}
                                                {flight[7].map((r, i) => (
                                                    <h6 key={i}>r.dateTime - r.risk</h6>
                                                ))}
                                            </Tooltip>
                                        }
                                    >
                                        <Image src={cautionLogo} alt="" fluid style={{ height: "1.7rem" }} />
                                    </OverlayTrigger>
                                    // <OverlayTrigger overlay={<Tooltip>dqs</Tooltip>}>
                                    //     <Image src={cautionLogo} alt="" fluid style={{ height: "1.2rem" }} />
                                    // </OverlayTrigger>
                                )}
                                {flight[8].length > 0 && (
                                    <OverlayTrigger
                                        overlay={
                                            <Popover id="popover-basic">
                                                <Popover.Header as="h6">Air risks</Popover.Header>
                                                <Popover.Body>
                                                    <ListGroup variant="flush">
                                                        {flight[8].map((r, i) => (
                                                            <ListGroup.Item key={i}>
                                                                {r.validated ? "✔" : "❌"} {r.name} -{" "}
                                                                {airRiskType[r.riskType]}
                                                            </ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                </Popover.Body>
                                            </Popover>
                                        }
                                    >
                                        <Button variant="outline-primary" size="sm">
                                            Air Risk
                                        </Button>
                                    </OverlayTrigger>
                                    // <OverlayTrigger overlay={<Tooltip>dqs</Tooltip>}>
                                    //     <Image src={cautionLogo} alt="" fluid style={{ height: "1.2rem" }} />
                                    // </OverlayTrigger>
                                )}
                            </Stack>
                        </Col>
                    </Card.Title>
                    <hr />
                    <Card.Text>
                        <Row>
                            <Col sm={1}>
                                <Image src={pilotLogo} alt="" fluid style={{ height: "2rem" }} />
                            </Col>
                            <Col sm={10}>
                                <FlightState flightState={flight[5]}></FlightState>
                            </Col>
                            <Col sm={1}>
                                <Button variant="outline-primary" size="sm" onClick={handleShow}>
                                    {">"}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Text>
                    <hr />
                    <Card.Text>
                        <Row>
                            <Col sm={1}>
                                <Image src={droneLogo} alt="" fluid style={{ height: "2rem" }} />
                            </Col>
                            <Col sm={10}>
                                <FlightState flightState={flight[6]}></FlightState>
                            </Col>
                        </Row>
                    </Card.Text>
                    <div className="text-end">
                        <Card.Link href="#" onClick={() => changeVisibility(id)}>
                            {"Details >"}
                        </Card.Link>
                    </div>
                </Card.Body>
            </Card>
            <Offcanvas show={show} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Change Flight State</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <h6>Actual state: {flightState[flight[5]]}</h6>
                    <hr></hr>
                    <h6>Select new state:</h6>
                    <Form.Select name={"flightState"} ref={piloFlightStateRef}>
                        <option value="noConops">Choose State</option>
                        {Object.values(flightState).map(
                            (s, i) =>
                                i > flight[5] && (
                                    <option value={i} key={i}>
                                        {s}
                                    </option>
                                )
                        )}
                    </Form.Select>
                    <Button className="mt-3" variant="primary" onClick={submitState}>
                        Submit
                    </Button>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default FlightCard;
