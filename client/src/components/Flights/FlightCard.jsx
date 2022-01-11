import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";

function FlightCard({ flight, changeVisibility, id }) {
    const [flightInfo, setFlightInfo] = useState();

    useEffect(() => {
        (async () => {})();
    }, []);

    return (
        <Card>
            <Card.Body>
                <Card.Title className="text-center">{flight[0].substring(0, 8)}...</Card.Title>
                <Card.Text>parcel picked up: {flight[1].toString()}</Card.Text>
                <Card.Text>parcel delivered: {flight[2].toString()}</Card.Text>
                <Card.Text>pilot state: {flight[5]}</Card.Text>
                <Card.Text>drone state: {flight[6]}</Card.Text>
                <Card.Link href="#" onClick={() => changeVisibility(id)}>
                    More Info
                </Card.Link>
            </Card.Body>
        </Card>
    );
}

export default FlightCard;
