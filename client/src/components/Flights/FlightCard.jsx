import React, { useEffect, useState } from "react";
import { Row, Card, Col, Image, Stack, OverlayTrigger, Tooltip } from "react-bootstrap";
import deliveredLogo from "../../img/delivered.png";
import pickedupLogo from "../../img/drone.png";
import engineLogo from "../../img/engine.png";
import batteryLogo from "../../img/battery.png";
import telecomLogo from "../../img/telecom.png";
import droneLogo from "../../img/drone-solo.png";
import pilotLogo from "../../img/pilot.png";
import cautionLogo from "../../img/caution.png";

import FlightState from "./FlightState";

function FlightCard({ flight, changeVisibility, id }) {
    const [flightInfo, setFlightInfo] = useState();

    return (
        <Card>
            <Card.Body>
                <Card.Title className="text-start d-flex align-items-center">
                    {/* <Row> */}
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
                                            {flight[7].map((r) => (
                                                <h6 key={e}>r.dateTime - r.risk</h6>
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
                        </Stack>
                    </Col>
                    {/* </Row> */}
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
    );
}

export default FlightCard;
