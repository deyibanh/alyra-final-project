import React from "react";
import { Card } from "react-bootstrap";

function ConopsCard({ conops, changeVisibility, id }) {
    return (
        <Card bg={conops.activated ? "light" : "secondary"} text={conops.activated ? "dark" : "white"}>
            <Card.Body>
                <Card.Title className="text-center">{conops.name}</Card.Title>
                <Card.Text>GRC: {conops.grc}</Card.Text>
                <Card.Text>ARC: {conops.arc}</Card.Text>
                <Card.Link href="#" onClick={() => changeVisibility(id)}>
                    More Info
                </Card.Link>
            </Card.Body>
        </Card>
    );
}

export default ConopsCard;
