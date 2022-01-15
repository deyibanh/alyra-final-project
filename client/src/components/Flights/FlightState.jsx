import React, { useEffect, useState } from "react";
import { Card, Col, Image, Stack, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Steps } from "rsuite";
import "rsuite/dist/rsuite.min.css";

function FlightState({ flightState }) {
    const [status, setStatus] = useState("process");
    const [simpleState, setSimpleState] = useState(0);

    useEffect(() => {
        switch (flightState) {
            case 0:
                setStatus("process");
                setSimpleState(0);
                break;
            case 1:
                setStatus("error");
                setSimpleState(0);
                break;
            case 2:
                setStatus("process");
                setSimpleState(1);
                break;
            case 3:
                setStatus("wait");
                setSimpleState(1);
                break;
            case 4:
                setStatus("error");
                setSimpleState(1);
                break;
            case 5:
                setStatus("finish");
                setSimpleState(2);
                break;
            default:
                setIsCancel = false;
                setIsPaused = false;
                setIsAborted = false;
                break;
        }
    }, [flightState]);

    const description = () => {
        switch (status) {
            case "wait":
                return "Flight is paused";
            case "error":
                return `Flight is ${simpleState === 0 ? "cancel" : "aborted"}`;
            default:
                return;
        }
    };

    return (
        <>
            <Steps current={simpleState} currentStatus={status}>
                <Steps.Item title="Flight planned" description={simpleState === 0 && description()} />
                <Steps.Item title="In Progress" description={simpleState === 1 && description()} />
                <Steps.Item title="End" description={simpleState === 2 && description()} />
            </Steps>
        </>
    );
}

export default FlightState;
