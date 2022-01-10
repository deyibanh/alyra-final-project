import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import StarwingsMasterArtifact from "./artifacts/contracts/StarwingsMaster.sol/StarwingsMaster.json";
import SWAccessControlArtifact from "./artifacts/contracts/SWAccessControl.sol/SWAccessControl.json";
import Header from "./components/Header";
import AccessControl from "./pages/AccessControl";
import Deliveries from "./pages/Deliveries";
import Flights from "./pages/Flights";
import NotFound from "./pages/NotFound";
import DroneSimulator from "./pages/DroneSimulator";
import getEthersProvider from "./utils/getEthers";
import "./App.css";
import { Container } from "react-bootstrap";

const StarwingsMasterAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
// const SWAccessControlAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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

    useEffect(() => {
        (async () => {
            try {
                const provider = await getEthersProvider();
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
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <div className="App">
                <Header state={state} />
                <Container>
                    <Routes>
                        <Route exact path="/" element={<Deliveries state={state} />} />
                        <Route
                            path="/deliveries"
                            element={<Deliveries state={state} StarwingsMasterProvider={StarwingsMasterProvider} />}
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
                        <Route path="/access-control" element={<AccessControl state={state} />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Container>
            </div>
        </BrowserRouter>
    );
}

export default App;
