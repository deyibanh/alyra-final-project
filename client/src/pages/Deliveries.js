/* eslint-disable prettier/prettier */
import { Col, Nav, Row, Tab } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import DeliveriesList from "../components/Deliveries/DeliveriesList";
import "./Deliveries.css";
import { checkProperties } from "ethers/lib/utils";

function Deliveries(props) {
    const state = props.state;
    const StarwingsMasterProvider = props.StarwingsMasterProvider;
    const StarwingsMasterSigner = props.StarwingsMasterSigner;

    return (
        <div className="Deliveries">
            <h1>Deliveries</h1>

            <div className="FlightsMenu">
                <Tab.Container id="left-tabs-example" defaultActiveKey="all_deliveries">
                    <Row>
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="all_deliveries">All</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="my_deliveries">My Deliveries</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="all_deliveries">
                                    <DeliveriesList
                                        state={state}
                                        StarwingsMasterProvider={StarwingsMasterProvider}
                                        StarwingsMasterSigner={StarwingsMasterSigner}
                                    ></DeliveriesList>
                                </Tab.Pane>
                                <Tab.Pane eventKey="my_deliveries">
                                    <div>Nothing yet.</div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </div>
    );
}

export default Deliveries;
