import { render } from "@testing-library/react";
import React, { useState, useEffect } from "react";
import { Button, Col, Form, FormControl, InputGroup, Modal, Row } from "react-bootstrap";

function DeliveriesList(props) {
    const state = props.state;
    const StarwingsMasterProvider = props.StarwingsMasterProvider;
    const StarwingsMasterSigner = props.StarwingsMasterSigner;
    const [deliveriesList, setDeliveriesList] = useState([]);

    useEffect(() => {
        (async () => {
            if (StarwingsMasterProvider) {
                try {
                    const allDeliveriesList = await StarwingsMasterProvider.getAllDeliveries();
                    setDeliveriesList(allDeliveriesList);
                    console.log(allDeliveriesList);
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    }, [StarwingsMasterProvider]);

    return <div></div>;
}

export default DeliveriesList;
