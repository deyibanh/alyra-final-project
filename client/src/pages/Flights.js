import React from "react";
import { Col, Nav, Row, Tab } from "react-bootstrap";
import FlightsContent from "../components/Flights/FlightsContent";
import "./Flights.css";

function Flights(props) {
    const state = props.state;
    const StarwingsMasterProvider = props.StarwingsMasterProvider;
    const StarwingsMasterSigner = props.StarwingsMasterSigner;

    return (
        <div className="Flights">
            <h1>Flights</h1>

            <div className="FlightsMenu">
                <Tab.Container id="left-tabs-example" defaultActiveKey="flights">
                    <Row>
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="flights">Flights</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="flights">
                                    <FlightsContent state={state} />
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
