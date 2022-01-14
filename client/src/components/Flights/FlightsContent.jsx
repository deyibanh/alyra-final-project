import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { ethers } from "ethers";
import StarwingsMasterArtifact from "../../artifacts/contracts/StarwingsMaster.sol/StarwingsMaster.json";
import droneDeliveryArtifact from "../../artifacts/contracts/DroneDelivery.sol/DroneDelivery.json";
import FlightCard from "./FlightCard";

const contractAddresses = require("../../contractAddresses.json");

const StarwingsMasterAddress = contractAddresses.StarwingsMaster;

function useInterval(callback, delay) {
    const savedCallback = useRef(callback);

    // Remember the latest callback if it changes.
    useLayoutEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        // Don't schedule if no delay is specified.
        // Note: 0 is a valid value for delay.
        if (!delay && delay !== 0) {
            return;
        }

        const id = setInterval(() => savedCallback.current(), delay);

        return () => clearInterval(id);
    }, [delay]);
}

function FlightsContent({ state }) {
    const [flights, setFlights] = useState([]);
    const [starwingsMaster, setStarwingsMaster] = useState({});
    const [viewDetails, setViewDetails] = useState(-1);
    const [cardGroupSize, setCardGroupSize] = useState(3);

    useInterval(() => {
        getFlights();
    }, 10000);

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
                let infos = await provider.flightInfoDisplay();
                [0, 1, 2].map((val) => {
                    (async () => {
                        let value = await provider.getPreFlightChecks(val);
                        infos = [...infos, value];
                    })();
                });
                [0, 1, 2].map((val) => {
                    (async () => {
                        let value = await provider.getPostFlightChecks(val);
                        infos = [...infos, value];
                    })();
                });
                // const preFlightCheck = await.provider
                flightsInfo.push(infos);
                // flightsInfo.push(address);
                // provider.on("DeliveryCreated", (deliveryId) => {
                //     getDeliveries();
                // });
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
                            <FlightCard flight={f} changeVisibility={changeVisibility} id={i} state={state} />
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
