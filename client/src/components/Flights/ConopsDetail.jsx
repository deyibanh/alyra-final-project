import React from "react";
import { Card, Button } from "react-bootstrap";

function ConopsDetail({ conops, changeVisibility, airRistType }) {
    return (
        <div>
            <Button variant="primary" onClick={() => changeVisibility(-1)}>
                {"< Back"}
            </Button>
            <h3>{conops.name}</h3>
            <h6 className="mt-4">Ground Security Analysis</h6>
            <div>
                <u>Starting Point:</u>
                <br></br>
                {conops.startingPoint}
            </div>
            <div>
                <u>End Point:</u>
                <br></br>
                {conops.endPoint}
            </div>
            <div>
                <u>Crossroad:</u>
                <br></br>
                {conops.crossRoad}
            </div>
            <div>
                <u>Exclusion Zone:</u>
                <br></br>
                {conops.exclusionZone}
            </div>
            <div>
                <u>Ground Risk Classification:</u>
                <br></br>
                {conops.grc}
            </div>
            <h6 className="mt-4">Air Security Analysis</h6>
            {conops.airRiskList.map((r, i) => (
                <div key={i}>
                    <u>Air Risk {i}</u>
                    <br></br>
                    {r.name}
                    <br></br>
                    {airRistType[r.riskType]}
                </div>
            ))}
            <div>
                <u>Air Risk Classification:</u>
                <br></br>
                {conops.arc}
            </div>
        </div>
    );
}

export default ConopsDetail;
