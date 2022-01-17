require("dotenv").config();
const ethers = require("ethers");
const hardhat = require("hardhat");
const StarwingsMasterArtifact = require("../client/src/artifacts/contracts/StarwingsMaster.sol/StarwingsMaster.json");
const DeliveryManagerArtifact = require("../client/src/artifacts/contracts/DeliveryManager.sol/DeliveryManager.json");
const ConopsManagerArtifact = require("../client/src/artifacts/contracts/ConopsManager.sol/ConopsManager.json");
const DroneFlightFactoryArtifact = require("../client/src/artifacts/contracts/DroneFlightFactory.sol/DroneFlightFactory.json");
const SWAccessControlArtifact = require("../client/src/artifacts/contracts/SWAccessControl.sol/SWAccessControl.json");
const DroneDeliveryArtifact = require("../client/src/artifacts/contracts/DroneDelivery.sol/DroneDelivery.json");
const contractAddresses = require("../client/src/contractAddresses.json");
const StarwingsMasterAddress = contractAddresses.StarwingsMaster;
const DeliveryManagerAddress = contractAddresses.DeliveryManager;
const ConopsManagerAddress = contractAddresses.ConopsManager;
const DroneFlightFactoryAddress = contractAddresses.DroneFlightFactory;
const SWAccessControlAddress = contractAddresses.SWAccessControl;

// Contracts
const provider = ethers.getDefaultProvider("http://localhost:8545");
const StarwingsMaster = new ethers.Contract(
    StarwingsMasterAddress,
    StarwingsMasterArtifact.abi
);
const DeliveryManager = new ethers.Contract(
    DeliveryManagerAddress,
    DeliveryManagerArtifact.abi
);
const ConopsManager = new ethers.Contract(
    ConopsManagerAddress,
    ConopsManagerArtifact.abi
);
const DroneFlightFactory = new ethers.Contract(
    DroneFlightFactoryAddress,
    DroneFlightFactoryArtifact.abi
);
const SWAccessControl = new ethers.Contract(
    SWAccessControlAddress,
    SWAccessControlArtifact.abi
);

const DeliveryStatusLabel = [
    "No Info",
    "Registered",
    "At Hub",
    "Planned",
    "In Delivery",
    "Arrived",
    "Delivered",
];

const flightStateLabel = [
    "PreFlight",
    "Canceled",
    "Flying",
    "Paused",
    "Aborted",
    "Ended",
];

// Events
StarwingsMaster.connect(provider).on("PilotAdded", (pilotAddress) => {
    console.log(`EVENT - Pilot ${pilotAddress} added.`);
});

StarwingsMaster.connect(provider).on("DroneAdded", (droneAddress) => {
    console.log(`EVENT - Drone ${droneAddress} added.`);
});

DeliveryManager.connect(provider).on("DeliveryCreated", (deliveryId) => {
    console.log(`EVENT - Delivery ${deliveryId} created.`);
});

DeliveryManager.connect(provider).on(
    "DeliveryStatusUpdated",
    (deliveryId, oldStatus, newStatus) => {
        console.log(
            `EVENT - Delivery ${deliveryId} status updated from ${DeliveryStatusLabel[oldStatus]} to ${DeliveryStatusLabel[newStatus]}.`
        );
    }
);

ConopsManager.connect(provider).on("ConopsCreated", (conopsID, name) => {
    console.log(`EVENT - CONOPS ${conopsID} created: ${name}.`);
});

// Wallets
const mnemonic = process.env.MNEMONIC;
const adminWallet = ethers.Wallet.fromMnemonic(
    mnemonic,
    "m/44'/60'/0'/0/0"
).connect(provider);
const pilot1Wallet = ethers.Wallet.fromMnemonic(
    mnemonic,
    "m/44'/60'/0'/0/11"
).connect(provider);
const pilot2Wallet = ethers.Wallet.fromMnemonic(
    mnemonic,
    "m/44'/60'/0'/0/12"
).connect(provider);
const drone1Wallet = ethers.Wallet.fromMnemonic(
    mnemonic,
    "m/44'/60'/0'/0/13"
).connect(provider);
const drone2Wallet = ethers.Wallet.fromMnemonic(
    mnemonic,
    "m/44'/60'/0'/0/14"
).connect(provider);

const pilotsData = [
    {
        name: "Pilot Simulator 1",
        address: pilot1Wallet.address,
    },
    {
        name: "Pilot Simulator 2",
        address: pilot2Wallet.address,
    },
];
const dronesData = [
    {
        id: "DRONE-SIMULATOR-1",
        type: "Drone Simulator",
        address: drone1Wallet.address,
    },
    {
        id: "DRONE-SIMULATOR-2",
        type: "Drone Simulator",
        address: drone2Wallet.address,
    },
];
const deliveriesData = [
    {
        deliveryId: "",
        supplierOrderId: "0000001",
        state: 0,
        from: "Simulator Sender",
        fromAddr: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
        to: "Simulator Receiver",
        toAddr: "0x976ea74026e726554db657fa54763abd0c3a0aa9",
        fromHubId: 100,
        toHubId: 300,
    },
    {
        deliveryId: "",
        supplierOrderId: "0000002",
        state: 0,
        from: "Simulator Sender",
        fromAddr: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
        to: "Simulator Receiver",
        toAddr: "0x976ea74026e726554db657fa54763abd0c3a0aa9",
        fromHubId: 100,
        toHubId: 300,
    },
    {
        deliveryId: "",
        supplierOrderId: "0000003",
        state: 0,
        from: "Simulator Sender",
        fromAddr: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
        to: "Simulator Receiver",
        toAddr: "0x976ea74026e726554db657fa54763abd0c3a0aa9",
        fromHubId: 100,
        toHubId: 300,
    },
];
const conopsListData = [
    {
        name: "Paris 1 km",
        startingPoint: "Simul HUB Paris 1",
        endPoint: "Simul HUB Paris 2",
        crossRoad: "None",
        exclusionZone: "None",
        airRisks: [
            { validated: false, name: "Aerodrome 1", riskType: 0 },
            { validated: false, name: "CHU 1", riskType: 1 },
        ],
        grc: 4,
        arc: 0,
    },
    {
        name: "Paris 3 km",
        startingPoint: "Simul HUB Paris 1",
        endPoint: "Simul HUB Paris 3",
        crossRoad: "None",
        exclusionZone: "None",
        airRisks: [
            { validated: false, name: "Aerodrome 1", riskType: 0 },
            { validated: false, name: "CHU 1", riskType: 1 },
        ],
        grc: 4,
        arc: 0,
    },
];

async function simulate() {
    try {
        const droneDeliveryFactory = await hardhat.ethers.getContractFactory(
            "DroneDelivery"
        );

        const rolePilot = await SWAccessControl.connect(
            adminWallet
        ).PILOT_ROLE();
        const roleDrone = await SWAccessControl.connect(
            adminWallet
        ).DRONE_ROLE();

        console.log("1) Assigning Access");
        for (const pilot of pilotsData) {
            console.log(`Adding Pilot: ${pilot.name} (${pilot.address})...`);
            await StarwingsMaster.connect(adminWallet).addPilot(
                pilot.address,
                pilot.name
            );
            await SWAccessControl.connect(adminWallet).grantRole(
                rolePilot,
                pilot.address
            );
        }

        for (const drone of dronesData) {
            console.log(`Adding Drone: ${drone.id} (${drone.address})...`);
            await StarwingsMaster.connect(adminWallet).addDrone(
                drone.address,
                drone.id,
                drone.type
            );
            await SWAccessControl.connect(adminWallet).grantRole(
                roleDrone,
                drone.address
            );
        }

        console.log("2) Create Delivery");
        for (const delivery of deliveriesData) {
            console.log(`Adding Delivery: ${delivery.supplierOrderId}...`);
            await DeliveryManager.connect(adminWallet).newDelivery(delivery);
        }

        console.log("3) Create CONOPS");
        for (const conops of conopsListData) {
            console.log(`Adding CONOPS: ${conops.name}...`);
            await ConopsManager.connect(adminWallet).addConops(
                conops.name,
                conops.startingPoint,
                conops.endPoint,
                conops.crossRoad,
                conops.exclusionZone,
                conops.airRisks,
                conops.grc,
                conops.arc
            );
        }

        console.log("4) Create DroneDelivery");
        const deliveries = await DeliveryManager.connect(
            pilot1Wallet
        ).getAllDeliveries();
        const conopsList = await ConopsManager.connect(
            pilot1Wallet
        ).viewAllConops();
        const conops1 = conopsList[2];
        const delivery1 = deliveries[2];

        console.log(
            `Creating DroneDelivery for deliveryId: ${delivery1.deliveryId}...`
        );

        const pilot1 = await StarwingsMaster.connect(pilot1Wallet).getPilot(
            pilot1Wallet.address
        );
        const drone1 = await StarwingsMaster.connect(pilot1Wallet).getDrone(
            drone1Wallet.address
        );
        const droneFlightDataSample = {
            pilot: pilot1,
            drone: drone1,
            conopsId: 2,
            flightDatetime: new Date("01/02/2022") / 1000,
            flightDuration: 1,
            depart: conops1.startingPoint,
            destination: conops1.endPoint,
        };
        // console.log(droneFlightDataSample);
        const salt = Date.now();

        const bytecode = ethers.utils.arrayify(
            ethers.utils.hexConcat([
                droneDeliveryFactory.bytecode,
                droneDeliveryFactory.interface.encodeDeploy([
                    DeliveryManagerAddress,
                    "TEST",
                    ConopsManagerAddress,
                    SWAccessControlAddress,
                    StarwingsMasterAddress,
                ]),
            ])
        );
        const result = await DroneFlightFactory.connect(pilot1Wallet).deploy(
            bytecode,
            salt,
            {
                gasLimit: 9000000,
            }
        );

        // // Get event values
        const temp = await result.wait();
        const droneDeliveryAddr = temp.events?.filter((x) => {
            return x.event === "Deployed";
        })[0].args.addr;

        // Create contract object with deployed address
        const DroneDelivery = new ethers.Contract(
            droneDeliveryAddr,
            droneDeliveryFactory.interface
        );

        await DroneDelivery.connect(pilot1Wallet).initDelivery(
            droneFlightDataSample
        );

        console.log("5) Validate AirRisk");
        await DroneDelivery.connect(pilot1Wallet).validateAirRisk(0);
        await DroneDelivery.connect(pilot1Wallet).validateAirRisk(1);

        console.log("6) Pre-Flight Checks");
        const droneDeliveryAddresses = await DroneFlightFactory.connect(
            pilot1Wallet
        ).getDeployedContracts();
        // const droneDelivery1 = new ethers.Contract(
        //     droneDeliveryAddresses[0],
        //     DroneDeliveryArtifact.abi
        // );

        DroneDelivery.connect(provider).on("ParcelPickedUp", () => {
            console.log(`EVENT - Parcel has been picked up.`);
        });
        DroneDelivery.connect(provider).on("ParcelDelivered", () => {
            console.log(`EVENT - Parcel has been delivered.`);
        });
        DroneDelivery.connect(provider).on("CheckpointAdded", (checkpoint) => {
            console.log(
                `EVENT - Checkpoint (lat, long, time) ${checkpoint} added.`
            );
        });

        await DroneDelivery.connect(pilot1Wallet).preFlightChecks(0);
        const preFlightCheckMotor = await DroneDelivery.connect(
            pilot1Wallet
        ).getPreFlightChecks(0);
        console.log(
            `Pre-flight for deliveryId: ${delivery1.deliveryId} - Check motor ${preFlightCheckMotor}`
        );
        await DroneDelivery.connect(pilot1Wallet).preFlightChecks(1);
        const preFlightCheckBattery = await DroneDelivery.connect(
            pilot1Wallet
        ).getPreFlightChecks(1);
        console.log(
            `Pre-flight for deliveryId: ${delivery1.deliveryId} - Check battery ${preFlightCheckBattery}`
        );
        await DroneDelivery.connect(pilot1Wallet).preFlightChecks(2);
        const preFlightCheckControlStation = await DroneDelivery.connect(
            pilot1Wallet
        ).getPreFlightChecks(2);
        console.log(
            `Pre-flight for deliveryId: ${delivery1.deliveryId} - Check control station ${preFlightCheckControlStation}`
        );

        console.log("7) Drone pick up parcel");
        await DroneDelivery.connect(drone1Wallet).pickUp();
        const droneParcelPickedUp = await DroneDelivery.connect(
            drone1Wallet
        ).isParcelPickedUp();
        console.log(`Parcel pick up status: ${droneParcelPickedUp}`);

        console.log("8) Flight status");
        let pilotFlightStatus = await DroneDelivery.connect(
            pilot1Wallet
        ).viewPilotFlightstatus();
        let droneFlightStatus = await DroneDelivery.connect(
            pilot1Wallet
        ).viewDroneFlightstatus();
        console.log(
            `Pilot Flight Status: ${flightStateLabel[pilotFlightStatus]}`
        );
        console.log(
            `Drone Flight Status: ${flightStateLabel[droneFlightStatus]}`
        );

        await DroneDelivery.connect(pilot1Wallet).changeFlightStatus(2);
        await DroneDelivery.connect(drone1Wallet).changeFlightStatus(2);

        pilotFlightStatus = await DroneDelivery.connect(
            pilot1Wallet
        ).viewPilotFlightstatus();
        droneFlightStatus = await DroneDelivery.connect(
            pilot1Wallet
        ).viewDroneFlightstatus();
        console.log(
            `Pilot Flight Status: ${flightStateLabel[pilotFlightStatus]}`
        );
        console.log(
            `Drone Flight Status: ${flightStateLabel[droneFlightStatus]}`
        );

        // newRiskEvent(Event memory _event)
        // function viewRiskEvent(uint256 _eventId)
        // newRiskEvent(Event memory _event)
        // function viewRiskEvent(uint256 _eventId)
        // newRiskEvent(Event memory _event)
        // function viewRiskEvent(uint256 _eventId)
        // cancelFlight
        // DroneFlight.changeFlightStatus(uint256 _status)
        console.log(`Adding checkpoint lat:23; long:27`);
        await DroneDelivery.connect(drone1Wallet).addCheckpoint({
            latitude: 23,
            longitude: 27,
        });
        console.log(`Adding checkpoint lat:24; long:27`);
        await DroneDelivery.connect(drone1Wallet).addCheckpoint({
            latitude: 24,
            longitude: 27,
        });
        console.log(`Adding checkpoint lat:25; long:27`);
        await DroneDelivery.connect(drone1Wallet).addCheckpoint({
            latitude: 25,
            longitude: 27,
        });

        console.log("9) Drone deliver parcel");
        await DroneDelivery.connect(drone1Wallet).deliver();
        const droneParcelDelivered = await DroneDelivery.connect(
            drone1Wallet
        ).isParcelDelivered();
        console.log(`Parcel delivered status: ${droneParcelDelivered}`);

        console.log("10) Post-Flight Checks");
        await DroneDelivery.connect(pilot1Wallet).postFlightChecks(0);
        const postFlightCheckMotor = await DroneDelivery.connect(
            pilot1Wallet
        ).getPostFlightChecks(0);
        console.log(
            `Post-flight for deliveryId: ${delivery1.deliveryId} - Check motor ${postFlightCheckMotor}`
        );
        await DroneDelivery.connect(pilot1Wallet).postFlightChecks(1);
        const postFlightCheckBattery = await DroneDelivery.connect(
            pilot1Wallet
        ).getPostFlightChecks(1);
        console.log(
            `Post-flight for deliveryId: ${delivery1.deliveryId} - Check battery ${postFlightCheckBattery}`
        );
        await DroneDelivery.connect(pilot1Wallet).postFlightChecks(2);
        const postFlightCheckControlStation = await DroneDelivery.connect(
            pilot1Wallet
        ).getPostFlightChecks(2);
        console.log(
            `Post-flight for deliveryId: ${delivery1.deliveryId} - Check control station ${postFlightCheckControlStation}`
        );

        await DroneDelivery.connect(pilot1Wallet).changeFlightStatus(5);
        await DroneDelivery.connect(drone1Wallet).changeFlightStatus(5);

        pilotFlightStatus = await DroneDelivery.connect(
            pilot1Wallet
        ).viewPilotFlightstatus();
        droneFlightStatus = await DroneDelivery.connect(
            pilot1Wallet
        ).viewDroneFlightstatus();
        console.log(
            `Pilot Flight Status: ${flightStateLabel[pilotFlightStatus]}`
        );
        console.log(
            `Drone Flight Status: ${flightStateLabel[droneFlightStatus]}`
        );
    } catch (error) {
        console.error(error);
    }
}

simulate().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
