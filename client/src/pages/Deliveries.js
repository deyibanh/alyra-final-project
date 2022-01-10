import React, { useState, useEffect } from "react";
import TestDeliveriesContent from "../components/Deliveries/TempDeliveriesContent";
import "./Deliveries.css";

function Deliveries(props) {
    const state = props.state;

    return (
        <div className="Deliveries">
            <h1>Deliveries</h1>
            <TestDeliveriesContent state={state} />
        </div>
    );
}

export default Deliveries;
