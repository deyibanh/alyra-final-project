import React, { useState, useEffect } from "react";
import { Col, Nav, Row, Tab } from "react-bootstrap";
import "./Flights.css";

function Flights(props) {
    const state = props.state;

    return (
        <div className="Flights">
            <h1>Flights</h1>

            <div className="FlightsMenu">
                <Tab.Container id="left-tabs-example" defaultActiveKey="conops">
                    <Row>
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="conops">CONOPS</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="pilots">Pilots</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="drones">Drones</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="flights">Flights</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="conops">
                                    <div>There is no CONOPS yet.</div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="pilots">
                                    <div>There is no pilots yet.</div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="drones">
                                    <div>There is no drones yet.</div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="flights">
                                    <div>There is no flights yet.</div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </div>
    );
}

export default Flights;
