import React, { useState, useEffect, useReducer } from "react";
import { ethers } from "ethers";
import DeliveryArtifact from "../../artifacts/contracts/DeliveryManager.sol/DeliveryManager.json";
import { Button, Col, Modal, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";
import DeliveryForm from "./DeliveryForm";

const DeliveryManagerAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const formReducer = (state, event) => {
    if (event.type === "reset") {
        return {};
    }

    return {
        ...state,
        [event.name]: event.value,
    };
};

function DeliveriesList(props) {
    const state = props.state;
    const [deliveriesList, setDeliveriesList] = useState([]);
    const [deliveryManager, setDeliveryManager] = useState({});
    const [modalIsShown, setModalIsShown] = useState(false);
    const [formData, setFormData] = useReducer(formReducer, {});
    const [pending, setPending] = useState(true);
    const [eventToProcess, setEventToProcess] = useState(false);

    useEffect(() => {
        if (state.provider) {
            const provider = new ethers.Contract(DeliveryManagerAddress, DeliveryArtifact.abi, state.provider);
            const signer = new ethers.Contract(DeliveryManagerAddress, DeliveryArtifact.abi, state.signer);
            setDeliveryManager({ provider, signer });

            provider.on("DeliveryCreated", (deliveryId) => {
                setEventToProcess(!eventToProcess);
            });
        }
    }, [state]);

    useEffect(() => {
        if (deliveryManager.provider) {
            getDeliveries();
        }
    }, [deliveryManager, eventToProcess]);

    const getDeliveries = async () => {
        setPending(true);
        try {
            const deliveriesList = await deliveryManager.provider.getAllDeliveries();
            setDeliveriesList(deliveriesList);
        } catch (error) {
            console.error(error);
        }

        setPending(false);
    };

    const hideModal = () => {
        setModalIsShown(false);
    };

    const showModal = () => {
        setFormData({ type: "reset" });
        setModalIsShown(true);
    };

    const handleFormChange = (event) => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
            type: event.type,
        });
    };

    const submitCreateDelivery = async () => {
        const delivery = {
            deliveryId: "",
            supplierOrderId: formData.orderId,
            state: 0,
            from: formData.from,
            fromAddr: ethers.utils.getAddress(formData.fromAccount),
            to: formData.to,
            toAddr: ethers.utils.getAddress(formData.toAccount),
            fromHubId: Number(formData.fromHubId),
            toHubId: Number(formData.toHubId),
        };
        const tx = await deliveryManager.signer.newDelivery(delivery);
        await tx;
        hideModal();
    };

    const handleButtonClick = (state) => {
        console.log("clicked");
        console.log(state.target.id);
    };

    const columns = [
        {
            name: "Id",
            selector: (row) => `${row.deliveryId.substring(0, 8)}...`,
        },
        {
            name: "OrderId",
            selector: (row) => row.supplierOrderId,
        },
        {
            name: "State",
            selector: (row) => {
                switch (row.state) {
                    case 0:
                        return "No information";
                    case 1:
                        return "registered";
                    case 2:
                        return "atHub";
                    case 3:
                        return "inDelivery";
                    case 4:
                        return "arrived";
                    case 5:
                        return "delivered";
                    default:
                        return "Undef";
                }
            },
        },
        {
            name: "From",
            selector: (row) => row.from,
        },
        {
            name: "To",
            selector: (row) => row.to,
        },
        {
            name: "Depart hub",
            selector: (row) => row.fromHubId,
        },
        {
            name: "Dest. hub",
            selector: (row) => row.toHubId,
        },
        {
            cell: (row) => (
                <Button onClick={handleButtonClick} id={row.deliveryId} variant="warning" size="sm">
                    Process
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <div>
            {deliveriesList.length === 0 && <div>No deliveries.</div>}
            <Row className="justify-content-end">
                <Col
                    sm="auto"
                    onClick={async () => {
                        await getDeliveries();
                    }}
                >
                    <Button variant="primary">Refresh</Button>
                </Col>
                <Col sm="auto" onClick={showModal}>
                    <Button variant="primary">+ Add Delivery</Button>
                </Col>
            </Row>
            <Row className="g-2 mt-2">
                <Col>
                    <DataTable columns={columns} data={deliveriesList} progressPending={pending} />
                </Col>
            </Row>
            <Modal
                show={modalIsShown}
                onHide={hideModal}
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Create delivery</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DeliveryForm formChange={handleFormChange} setFormData={setFormData} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submitCreateDelivery}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default DeliveriesList;
