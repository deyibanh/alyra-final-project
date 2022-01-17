import React, { useState, useEffect } from "react";
import { Button, Col, Form, FormControl, Badge, Modal, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";

function DashboardContent(props) {
    const StarwingsMasterSigner = props.StarwingsMasterSigner;
    const [pilotAddressList, setPilotAddressList] = useState([]);
    const [pending, setPending] = useState(true);

    useEffect(() => {
        if (StarwingsMasterSigner) {
            getPilotList();

            StarwingsMasterSigner.on("PilotAdded", (pilotAddress) => {
                getPilotList();
            });

            StarwingsMasterSigner.on("PilotDeleted", (pilotAddress) => {
                getPilotList();
            });
        }
    }, [StarwingsMasterSigner]);

    const getPilotList = async () => {
        setPending(true);
        try {
            const pilotAddressListResult = await StarwingsMasterSigner.getPilotList();
            setPilotAddressList(pilotAddressListResult);
            console.log(pilotAddressListResult);
        } catch (error) {
            console.error(error);
        }

        setPending(false);
    };

    const columns = [
        {
            grow: 0,
            selector: (row) => {
                return row.isDeleted ? <Badge bg="danger">disable</Badge> : <Badge bg="success">enable</Badge>;
            },
        },
        // {
        //     name: "#",
        //     grow: 0,
        //     selector: (row) => row.index.toString(),
        // },
        {
            name: "Name",
            grow: 1,
            selector: (row) => row.name,
        },
        {
            name: "addr",
            grow: 0,
            selector: (row) => row.pilotAddress.substring(0, 5) + "...",
        },
        {
            name: "flight number",
            grow: 1,
            selector: (row) => row.flightAddresses.length,
        },
    ];

    return (
        <div className="PilotsContent">
            <Row style={{ marginTop: "30px" }}>
                <Col sm={9}>
                    <DataTable columns={columns} data={pilotAddressList} progressPending={pending} dense responsive />
                </Col>
            </Row>
        </div>
    );
}

export default DashboardContent;
