/* eslint-disable prettier/prettier */
// @todo: Fix linter/prettier for inline If with Logical && Operator.
import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import NavWalletStatus from "./NavWalletStatus.jsx";
import "./Header.css";

function Header(props) {
    const location = useLocation();
    const state = props.state;

    return (
        <header>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/">Starwings</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto" activeKey={location.pathname}>
                            {state.roles &&
                                (state.roles.hasDefaultAdminRole ||
                                    state.roles.hasAdminRole ) && (
                                <Nav.Link href="/admin-panel">Admin Panel</Nav.Link>
                            )}
                            {state.roles &&
                                (state.roles.hasDefaultAdminRole ||
                                    state.roles.hasAdminRole ) && (
                                <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                            )}
                            {state.roles &&
                                (state.roles.hasDefaultAdminRole ||
                                    state.roles.hasAdminRole ||
                                    state.roles.hasPilotRole) && <Nav.Link href="/deliveries">Deliveries</Nav.Link>}
                            {state.roles &&
                                (state.roles.hasDefaultAdminRole ||
                                    state.roles.hasAdminRole ||
                                    state.roles.hasPilotRole ||
                                    state.roles.hasDroneRole) && <Nav.Link href="/flights">Flights</Nav.Link>}
                            {/* {state.roles &&
                                (state.roles.hasDefaultAdminRole ||
                                    state.roles.hasAdminRole ||
                                    state.roles.hasPilotRole) && (
                                <Nav.Link href="/drone-simulator">Drone Simulator</Nav.Link>
                            )} */}
                        </Nav>
                        <NavWalletStatus state={state} />
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default Header;
