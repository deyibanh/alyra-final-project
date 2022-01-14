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
    const [parcelState, setParcelState] = useState(0);

    useEffect(() => {
        if (state.provider) {
            let address = flight[flight.length - 1];
            const provider = new ethers.Contract(address, DroneDeliveryArtifact.abi, state.provider);
            const signer = new ethers.Contract(address, DroneDeliveryArtifact.abi, state.signer);
            setDroneDelivery({ provider, signer });
        }
    }, [state]);

    useEffect(() => {
        const state = flight[1] ? (flight[2] ? 2 : 1) : 0;
        setParcelState(state);
    }, [flight]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const submitState = async () => {
        const tx =
            piloFlightStateRef.current.value == 1
                ? await droneDelivery.signer.cancelFlight()
                : await droneDelivery.signer.changeFlightStatus(piloFlightStateRef.current.value);
        await tx;
    };

    const parcelAction = async () => {
        const tx = parcelState === 0 ? droneDelivery.signer.pickUp() : droneDelivery.signer.deliver();
        await tx;
    };

    const handlePreChecks = async (check) => {
        const tx = droneDelivery.signer.preFlightChecks(check);
        await tx;
    };

    const handleAirRiskValidation = async (risk) => {
        const tx = droneDelivery.signer.validateAirRisk(risk);
        await tx;
    };

    return (
        <>
            <Card>
                <Card.Body>
                    <Card.Title className="text-start d-flex align-items-center">
                        <Col sm={3}>
                            <Stack gap={2} direction="horizontal">
                                {parcelState === 2 ? (
                                    <OverlayTrigger overlay={<Tooltip>Parcel delivered</Tooltip>}>
                                        <Image src={deliveredLogo} alt="" fluid style={{ height: "1.7rem" }} />
                                    </OverlayTrigger>
                                ) : (
                                    parcelState == 1 && (
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
                            {flight[5] !== 1 && state.roles.hasPilotRole && (
                                <Col sm={1}>
                                    <Button variant="outline-primary" size="sm" onClick={handleShow}>
                                        {">"}
                                    </Button>
                                </Col>
                            )}
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
                            {flight[5] !== 1 && state.roles.hasDroneRole && (
                                <Col sm={1}>
                                    {state.roles.hasDroneRole &&
                                        ((parcelState === 0 && flight[5] === 0 && (
                                            <Button
                                                className="mt-3"
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => parcelAction()}
                                            >
                                                Grab
                                            </Button>
                                        )) ||
                                            (parcelState === 1 && flight[5] === 5 && "Drop" && (
                                                <Button
                                                    className="mt-3"
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => parcelAction()}
                                                >
                                                    Drop
                                                </Button>
                                            )))}
                                </Col>
                            )}
                        </Row>
                    </Card.Text>
                </Card.Body>
            </Card>
            <Offcanvas show={show} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Update Flight</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {flight[5] === 0 && (
                        <>
                            <h5>AirRisk Validation</h5>
                            <div>
                                {flight[8].map((r, i) => (
                                    <div key={i}>
                                        {r.validated ? "✔" : "❌"} {r.name} - {airRiskType[r.riskType]}
                                        {!r.validated && (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleAirRiskValidation(i)}
                                            >
                                                val
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <hr />
                    {flight[5] === 0 && (
                        <>
                            <h5>Preflight checks:</h5>
                            <div>
                                {["Engine", "Battery", "Telecom"].map((e, i) => (
                                    <div key={i}>
                                        {e}
                                        {flight[i + 9] ? (
                                            "✔"
                                        ) : (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handlePreChecks(i)}
                                            >
                                                check
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {flight[5] > 3 && (
                        <>
                            <h5>Postflight checks:</h5>
                            <div>
                                {["Engine", "Battery", "Telecom"].map((e, i) => (
                                    <div key={i}>
                                        {e}
                                        {flight[i + 9] ? (
                                            "✔"
                                        ) : (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handlePostChecks(i)}
                                            >
                                                check
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <hr />
                    <h6>
                        Actual delivery state:{" "}
                        {(parcelState === 0 && "Parcel wait to be picked up") ||
                            (parcelState === 1 && "parcel in delivery") ||
                            (parcelState === 2 && "parcel delivered")}
                    </h6>
                    <hr />
                    <h6>Actual flight state: {flightState[flight[5]]}</h6>
                    <hr />
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
