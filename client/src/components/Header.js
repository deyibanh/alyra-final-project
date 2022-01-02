import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { CircleFill } from "react-bootstrap-icons";
import "./Header.css";

function Header(props) {
    const state = props.state;

    return (
        <header>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="#home">Starwings</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/access-control">Access Control</Nav.Link>
                        </Nav>
                        <Nav>
                            <NavDropdown
                                title={
                                    window.ethereum !== "undefined" && state.accounts ? (
                                        <div className="walletInfo">
                                            <CircleFill color="green" />
                                            <span className="walletInfoLabel">
                                                {state.accounts[0].substring(0, 5) +
                                                    "..." +
                                                    state.accounts[0].slice(-4)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="walletInfo">
                                            <CircleFill color="red" />
                                            <span className="walletInfoLabel">Wallet not connected</span>
                                        </div>
                                    )
                                }
                                align="end"
                                id="collasible-nav-dropdown"
                            >
                                <NavDropdown.ItemText align="end">
                                    <p>
                                        {state.accounts && (
                                            <span>
                                                {state.accounts[0]}
                                                <br />
                                            </span>
                                        )}
                                        <span>
                                            <u>Roles</u>:
                                        </span>
                                        <br />
                                        {state.roles && state.roles.hasDefaultAdminRole && (
                                            <span>
                                                - Owner
                                                <br />
                                            </span>
                                        )}
                                        {state.roles && state.roles.hasAdminRole && (
                                            <span>
                                                - Admin
                                                <br />
                                            </span>
                                        )}
                                        {state.roles && state.roles.hasPilotRole && (
                                            <span>
                                                - Pilot
                                                <br />
                                            </span>
                                        )}
                                        {state.roles && state.roles.hasDroneRole && (
                                            <span>
                                                - Drone
                                                <br />
                                            </span>
                                        )}
                                    </p>
                                </NavDropdown.ItemText>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default Header;
