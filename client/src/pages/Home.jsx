/* eslint-disable prettier/prettier */
import React from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import "./Deliveries.css";

function Home(props) {
    return (
        <div className="Home">
            <Row>
                <Col>
                    <br></br>
                    <h1 className="text-secondary">Welcome to the Starwings app !</h1>
                    <br></br>
                    {props.state.roles && (props.state.roles.hasDefaultAdminRole || props.state.roles.hasAdminRole) && (
                        <p>
                            Go to the <a href="/admin-panel">Admin Panel</a> to manage pilots, drones and conops
                        </p>
                    )}

                    <p>
                        If you are a pilot, you may want to go to <a href="/deliveries">Deliveries</a> page and process
                        a delivery !
                    </p>
                    <p>
                        You also can follow current and past flights at <a href="/flights">Flights</a> page.
                    </p>
                </Col>
            </Row>
        </div>
    );
}

export default Home;
