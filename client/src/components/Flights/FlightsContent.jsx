import React, { useState, useEffect, useReducer } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { ethers } from "ethers";
import StarwingsMasterArtifact from "../../artifacts/contracts/StarwingsMaster.sol/StarwingsMaster.json";
import droneDeliveryArtifact from "../../artifacts/contracts/DroneDelivery.sol/DroneDelivery.json";
import FlightCard from "./FlightCard";

const contractAddresses = require("../../contractAddresses.json");

const StarwingsMasterAddress = contractAddresses.StarwingsMaster;

function FlightsContent({ state }) {
    const [flights, setFlights] = useState([]);
    const [starwingsMaster, setStarwingsMaster] = useState({});
    const [viewDetails, setViewDetails] = useState(-1);
    const [cardGroupSize, setCardGroupSize] = useState(3);

    useEffect(() => {
        if (state.provider) {
            const provider = new ethers.Contract(StarwingsMasterAddress, StarwingsMasterArtifact.abi, state.provider);
            const signer = new ethers.Contract(StarwingsMasterAddress, StarwingsMasterArtifact.abi, state.signer);
            setStarwingsMaster({ provider, signer });

            // provider.on("ConopsCreated", (conopsId, name) => {
            //     setEventToProcess(!eventToProcess);
            // });
        }
    }, [state]);

    useEffect(() => {
        if (starwingsMaster.signer) {
            getFlights();
        }
    }, [starwingsMaster]);

    const getFlights = async () => {
        try {
            const flightsAddresses = await starwingsMaster.signer.getDroneFlightAddressList();
            let flightsInfo = [];
            for (let address of flightsAddresses) {
                const provider = new ethers.Contract(address, droneDeliveryArtifact.abi, state.provider);
                const infos = await provider.flightInfoDisplay();
                flightsInfo.push(infos);
            }
            setFlights(flightsInfo);
        } catch (error) {
            console.error(error);
        }
    };

    const changeVisibility = (i) => {
        i === -1 ? setCardGroupSize(3) : setCardGroupSize(1);
        setViewDetails(i);
    };

    return (
        <div className="ConopsContent">
            {flights.length === 0 && <div>No Flight at the moment</div>}
            <Row md={1} className="g-2 mt-2">
                {flights.map((f, i) =>
                    viewDetails === -1 ? (
                        <Col key={f[0]}>
                            <FlightCard flight={f} changeVisibility={changeVisibility} id={i} />
                        </Col>
                    ) : (
                        viewDetails === i && (
                            <Col key={f[0]}>
                                {/* <ConopsDetail
                                    conops={c}
                                    changeVisibility={changeVisibility}
                                    airRistType={airRistType}
                                /> */}
                            </Col>
                        )
                    )
                )}
            </Row>
        </div>
    );
}

export default FlightsContent;
