import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import StarwingsMasterArtifact from "./artifacts/contracts/StarwingsMaster.sol/StarwingsMaster.json";
import SWAccessControlArtifact from "./artifacts/contracts/SWAccessControl.sol/SWAccessControl.json";
import Header from "./components/Header";
import AdminPanel from "./pages/AdminPanel";
import Deliveries from "./pages/Deliveries";
import Flights from "./pages/Flights";
import NotFound from "./pages/NotFound";
import DroneSimulator from "./pages/DroneSimulator";
import Dashboard from "./pages/Dashboard";
import getEthersProvider from "./utils/getEthers";
import "./App.css";
import { Container } from "react-bootstrap";
import Home from "./pages/Home";
import backgroundImg from "./img/02.jpg";
const contractAddresses = require("./contractAddresses.json");

const StarwingsMasterAddress = contractAddresses.StarwingsMaster;

const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;
const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
const PILOT_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PILOT_ROLE"));
const DRONE_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DRONE_ROLE"));

function App() {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        accounts: null,
        roles: null,
    });
    const [StarwingsMasterProvider, setStarwingsMasterProvider] = useState();
    const [StarwingsMasterSigner, setStarwingsMasterSigner] = useState();
    const [SWAccessControl, setSWAccessControl] = useState();

    const reload = async (firstTime) => {
        let provider;
        if (firstTime) provider = await getEthersProvider();
        else provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();
        const accounts = await provider.listAccounts();

        const StarwingsMasterProviderInstance = new ethers.Contract(
            StarwingsMasterAddress,
            StarwingsMasterArtifact.abi,
            provider
        );
        const StarwingsMasterSignerInstance = new ethers.Contract(
            StarwingsMasterAddress,
            StarwingsMasterArtifact.abi,
            signer
        );
        setStarwingsMasterProvider(StarwingsMasterProviderInstance);
        setStarwingsMasterSigner(StarwingsMasterSignerInstance);

        const SWAccessControlAddress = await StarwingsMasterProviderInstance.getAccessControlAddress();
        const SWAccessControlInstance = new ethers.Contract(
            SWAccessControlAddress,
            SWAccessControlArtifact.abi,
            provider
        );
        setSWAccessControl(SWAccessControlInstance);

        let roles = {};

        try {
            const hasDefaultAdminRole = await SWAccessControlInstance.hasRole(DEFAULT_ADMIN_ROLE, accounts[0]);
            const hasAdminRole = await SWAccessControlInstance.hasRole(ADMIN_ROLE, accounts[0]);
            const hasPilotRole = await SWAccessControlInstance.hasRole(PILOT_ROLE, accounts[0]);
            const hasDroneRole = await SWAccessControlInstance.hasRole(DRONE_ROLE, accounts[0]);
            roles = {
                hasDefaultAdminRole: hasDefaultAdminRole,
                hasAdminRole: hasAdminRole,
                hasPilotRole: hasPilotRole,
                hasDroneRole: hasDroneRole,
            };
        } catch (error) {
            console.error(error);
        }

        setState({
            provider,
            signer,
            accounts,
            roles,
        });
    };

    useEffect(() => {
        (async () => {
            try {
                window.ethereum.on("accountsChanged", async function (accounts) {
                    await reload(false);
                });

                await reload(true);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <div
                className="App vh-100"
                style={{
                    background: `url(${backgroundImg})`,
                    backgroundSize: "cover",
                    boxShadow: "inset 0 0 0 1000px rgba(0,0,0,.2)",
                }}
            >
                <Header state={state} />
                <Container>
                    <Routes>
                        <Route exact path="/" element={<Home state={state} />} />

                        <Route
                            path="/deliveries"
                            element={
                                <Deliveries
                                    state={state}
                                    StarwingsMasterProvider={StarwingsMasterProvider}
                                    StarwingsMasterSigner={StarwingsMasterSigner}
                                />
                            }
                        />
                        <Route
                            path="/flights"
                            element={
                                <Flights
                                    state={state}
                                    StarwingsMasterProvider={StarwingsMasterProvider}
                                    StarwingsMasterSigner={StarwingsMasterSigner}
                                />
                            }
                        />
                        <Route path="/drone-simulator" element={<DroneSimulator state={state} />} />
                        {state.roles && (state.roles.hasAdminRole || state.roles.hasDefaultAdminRole) && (
                            <Route
                                path="/admin-panel"
                                element={
                                    <AdminPanel
                                        state={state}
                                        StarwingsMasterProvider={StarwingsMasterProvider}
                                        StarwingsMasterSigner={StarwingsMasterSigner}
                                    />
                                }
                            />
                        )}
                        {state.roles && (state.roles.hasAdminRole || state.roles.hasDefaultAdminRole) && (
                            <Route
                                path="/dashboard"
                                element={
                                    <Dashboard
                                        state={state}
                                        StarwingsMasterProvider={StarwingsMasterProvider}
                                        StarwingsMasterSigner={StarwingsMasterSigner}
                                    />
                                }
                            />
                        )}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Container>
            </div>
        </BrowserRouter>
    );
}

export default App;
