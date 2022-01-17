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
    Badge,
} from "react-bootstrap";
import deliveredLogo from "../../img/delivered.png";
import pickedupLogo from "../../img/drone.png";
import engineRedLogo from "../../img/engine-red.png";
import engineGreenLogo from "../../img/engine-green.png";
import batteryRedLogo from "../../img/battery-red.png";
import batteryGreenLogo from "../../img/battery-green.png";
import telecomRedLogo from "../../img/telecom-red.png";
import telecomGreenLogo from "../../img/telecom-green.png";
import droneLogo from "../../img/drone-solo.png";
import pilotLogo from "../../img/pilot.png";
import cautionLogo from "../../img/caution.png";
import FlightState from "./FlightState";
import { ethers } from "ethers";
import networksExplorer from "../../utils/networks";
import DroneDeliveryArtifact from "../../artifacts/contracts/DroneDelivery.sol/DroneDelivery.json";
import { Link } from "react-router-dom";

const flightState = {
    0: "Pre flight",
    1: "Canceled",
    2: "In flight",
    3: "Paused",
    4: "Aborted",
    5: "Ended",
};

const airRiskType = {
    0: "Aerodrome",
    1: "CHU",
    2: "Military Base",
};

const checks = {
    0: "Engine",
    1: "Battery",
    2: "Telecom",
};

const eventsName = [
    "PreFlightCheck",
    "PostFlightCheck",
    "AirRiskValidated",
    "AirRiskCanceled",
    "CancelFlight",
    "ChangeFlightStatus",
];

function FlightCard({ flight, changeVisibility, id, state }) {
    const [flightInfo, setFlightInfo] = useState();
    const [show, setShow] = useState(false);
    const piloFlightStateRef = useRef();
    const [droneDelivery, setDroneDelivery] = useState();
    const [parcelState, setParcelState] = useState(0);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (state.provider) {
            let address = flight[flight.length - 1];
            const provider = new ethers.Contract(address, DroneDeliveryArtifact.abi, state.provider);
            const signer = new ethers.Contract(address, DroneDeliveryArtifact.abi, state.signer);
            setDroneDelivery({ provider, signer });
        }
    }, [state]);

    useEffect(() => {
        if (droneDelivery) {
            let logs = [];
            (async () => {
                // const filter = await droneDelivery.provider.filters.PreFlightCheck();
                for (let eventName of eventsName) {
                    const log = await droneDelivery.provider.queryFilter(eventName);
                    logs = [...logs, ...log];
                }
                logs.sort((a, b) => a.blockNumber - b.blockNumber);
                setEvents(logs);
            })();
        }
    }, [droneDelivery]);

    // useEffect(() => {
    //     let eventsOrdered = events.sort((a, b) => a.blockNumber - b.blockNumber);
    // }, [events]);

    console.log(events);

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

    const handlePostChecks = async (check) => {
        const tx = droneDelivery.signer.postFlightChecks(check);
        await tx;
    };

    const handleAirRiskValidation = async (risk) => {
        const tx = droneDelivery.signer.validateAirRisk(risk);
        await tx;
    };

    const eventValue = (e) => {
        switch (e.event) {
            case "PreFlightCheck":
                return checks[e.args[0]];
            case "PostFlightCheck":
                return checks[e.args[0]];
            case "AirRiskValidated":
                return flight[8][ethers.BigNumber.from(e.args[0]).toString()].name;
            case "AirRiskCanceled":
            // return e.args[0];
            case "CancelFlight":
                return "";
            case "ChangeFlightStatus":
                return flightState[e.args[0]];
            default:
                break;
        }
    };

    console.log(ethers);
    console.log(state.provider._network.chainId);
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
                                <h6>
                                    <OverlayTrigger
                                        placement="right"
                                        trigger="click"
                                        rootClose
                                        overlay={
                                            <Popover id="popover-basic">
                                                <Popover.Header as="h6">Logs</Popover.Header>
                                                <Popover.Body>
                                                    <ListGroup variant="flush">
                                                        {events.map((e, i) => (
                                                            <ListGroup.Item key={i}>
                                                                {e.event}: {eventValue(e)}{" "}
                                                                {state.provider._network.chainId !== 1337 && (
                                                                    <a
                                                                        href={
                                                                            networksExplorer[
                                                                                state.provider._network.chainId
                                                                            ] +
                                                                            "/tx/" +
                                                                            e.transactionHash
                                                                        }
                                                                    >
                                                                        ds
                                                                    </a>
                                                                )}
                                                            </ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                </Popover.Body>
                                            </Popover>
                                        }
                                    >
                                        <Badge pill bg="secondary">
                                            logs
                                        </Badge>
                                    </OverlayTrigger>
                                </h6>
                            </Stack>
                        </Col>
                        <Col sm={4}>
                            <Stack gap={2} direction="horizontal">
                                <h6>PreFlight Checks:</h6>
                                <Image
                                    src={flight[9] ? engineGreenLogo : engineRedLogo}
                                    alt=""
                                    fluid
                                    style={{ height: "1.2rem" }}
                                />
                                <Image
                                    src={flight[10] ? batteryGreenLogo : batteryRedLogo}
                                    alt=""
                                    fluid
                                    style={{ height: "1.2rem" }}
                                />
                                <Image
                                    src={flight[11] ? telecomGreenLogo : telecomRedLogo}
                                    alt=""
                                    fluid
                                    style={{ height: "1.2rem" }}
                                />
                            </Stack>
                        </Col>
                        <Col sm={4}>
                            <Stack gap={2} direction="horizontal">
                                <h6>PostFlight Checks:</h6>
                                <Image
                                    src={flight[12] ? engineGreenLogo : engineRedLogo}
                                    alt=""
                                    fluid
                                    style={{ height: "1.2rem" }}
                                />
                                <Image
                                    src={flight[13] ? batteryGreenLogo : batteryRedLogo}
                                    alt=""
                                    fluid
                                    style={{ height: "1.2rem" }}
                                />
                                <Image
                                    src={flight[14] ? telecomGreenLogo : telecomRedLogo}
                                    alt=""
                                    fluid
                                    style={{ height: "1.2rem" }}
                                />
                            </Stack>
                        </Col>
                        <Col sm={1}>
                            <Stack gap={2} direction="horizontal">
                                {flight[7].length > 0 && (
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip>
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
                                        {flight[i + 12] ? (
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
                                ((!flight[3] && i == 1) || (flight[3] && i > flight[5])) && (
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
