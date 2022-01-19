import React from "react";
import { Col, Nav, Row, Tab } from "react-bootstrap";
import PilotsContent from "../components/AdminPanel/PilotsContent";
import DronesContent from "../components/AdminPanel/DronesContent";
import ConopsContent from "../components/AdminPanel/ConopsContent";
import "./AdminPanel.css";
import DashboardContent from "../components/Dashboard/DashboardContent";

function AdminPanel(props) {
    const state = props.state;
    const StarwingsMasterProvider = props.StarwingsMasterProvider;
    const StarwingsMasterSigner = props.StarwingsMasterSigner;

    return (
        <div className="AdminPanel">
            <h1>Dashboard</h1>

            <div className="AdminMenu">
                <Tab.Container id="left-tabs-example" defaultActiveKey="overview">
                    <Row>
                        <Col sm={2}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="overview">OverView</Nav.Link>
                                </Nav.Item>
                                {/* <Nav.Item>
                                    <Nav.Link eventKey="pilots">Pilots</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="drones">Drones</Nav.Link>
                                </Nav.Item> */}
                            </Nav>
                        </Col>
                        <Col sm={10}>
                            <Tab.Content>
                                <Tab.Pane eventKey="overview">
                                    <DashboardContent
                                        state={state}
                                        StarwingsMasterProvider={StarwingsMasterProvider}
                                        StarwingsMasterSigner={StarwingsMasterSigner}
                                    />
                                </Tab.Pane>
                                {/* <Tab.Pane eventKey="pilots">
                                    <PilotsContent
                                        state={state}
                                        StarwingsMasterProvider={StarwingsMasterProvider}
                                        StarwingsMasterSigner={StarwingsMasterSigner}
                                    ></PilotsContent>
                                </Tab.Pane>
                                <Tab.Pane eventKey="drones">
                                    <DronesContent
                                        state={state}
                                        StarwingsMasterProvider={StarwingsMasterProvider}
                                        StarwingsMasterSigner={StarwingsMasterSigner}
                                    ></DronesContent>
                                </Tab.Pane> */}
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </div>
    );
}

export default AdminPanel;
