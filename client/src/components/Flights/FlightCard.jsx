import React, { useEffect, useState } from "react";
import { Row, Card, Col, Image, Stack, OverlayTrigger, Tooltip } from "react-bootstrap";
import deliveredLogo from "../../img/delivered.png";
import pickedupLogo from "../../img/drone.png";
import FlightState from "./FlightState";

function FlightCard({ flight, changeVisibility, id }) {
    const [flightInfo, setFlightInfo] = useState();

    return (
        <Card>
            <Card.Body>
                <Card.Title className="text-start d-flex align-items-center">
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
                </Card.Title>
                <hr />
                <Card.Text>
                    <Row>
                        <Col sm={1}>
                            <strong>Pilot:</strong>
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
                            <strong>Drone:</strong>
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
