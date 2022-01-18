require("dotenv").config();
const sleep = require("util").promisify(setTimeout);
const ethers = require("ethers");
const hardhat = require("hardhat");
const simulatorData = require("./simulator-data.json");
// Contracts Artifacts
const conopsManagerArtifact = require("../client/src/artifacts/contracts/ConopsManager.sol/ConopsManager.json");
const deliveryManagerArtifact = require("../client/src/artifacts/contracts/DeliveryManager.sol/DeliveryManager.json");
const droneFlightFactoryArtifact = require("../client/src/artifacts/contracts/DroneFlightFactory.sol/DroneFlightFactory.json");
const starwingsMasterArtifact = require("../client/src/artifacts/contracts/StarwingsMaster.sol/StarwingsMaster.json");
const swAccessControlArtifact = require("../client/src/artifacts/contracts/SWAccessControl.sol/SWAccessControl.json");
// Contracts Addresses
const contractAddresses = require("../client/src/contractAddresses.json");
const conopsManagerContractAddress = contractAddresses.ConopsManager;
const deliveryManagerContractAddress = contractAddresses.DeliveryManager;
const droneFlightFactoryContractAddress = contractAddresses.DroneFlightFactory;
const starwingsMasterContractAddress = contractAddresses.StarwingsMaster;
const swAccessControlContractAddress = contractAddresses.SWAccessControl;
// Contracts
const provider = ethers.getDefaultProvider(hardhat.network.config.url);
const conopsManagerContract = new ethers.Contract(conopsManagerContractAddress, conopsManagerArtifact.abi, provider);
const deliveryManagerContract = new ethers.Contract(
    deliveryManagerContractAddress,
    deliveryManagerArtifact.abi,
    provider
);
const droneFlightFactoryContract = new ethers.Contract(
    droneFlightFactoryContractAddress,
    droneFlightFactoryArtifact.abi
);
const starwingsMasterContract = new ethers.Contract(
    starwingsMasterContractAddress,
    starwingsMasterArtifact.abi,
    provider
);
const swAccessControlContract = new ethers.Contract(
    swAccessControlContractAddress,
    swAccessControlArtifact.abi,
    provider
);

// Wallets
//
// Simulator signers.
// Admin:   0x74b890e6ADbBF8770904aA4d258760a755b43FE6 (0)
// Pilot 1: 0xfd0cc8b0a53c0ee688d4b8f6dd8b8e6853446eae (11)
// Pilot 2: 0x32f32610a2093443812451528aad4794b63c48a2 (12)
// Drone 1: 0x58dd19b1be64427743c1418069a72e358e3e33c3 (13)
// Drone 2: 0xcd397c8d4e88d2107739f35487ba27468e2dfb2c (14)
// From:    0xf7a7d83abeea9648c2aacadacddaf7209cc22144 (15)
// To 1:    0xcb91f83417711a6f5d5a3559b22357070eb8f5b8 (16)
// To 2:    0xa8acf37641d34f61dc9ea48b02b7fe05cd6cb7b3 (17)
const mnemonic = process.env.MNEMONIC;
const adminWallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0").connect(provider);
const pilot1Wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/11").connect(provider);
const pilot2Wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/12").connect(provider);
const drone1Wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/13").connect(provider);
const drone2Wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/14").connect(provider);
// const fromWallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/15").connect(provider);
// const to1Wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/16").connect(provider);
// const to2Wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/17").connect(provider);
let pilot1;
let pilot2;
let drone1;
let drone2;

const deliveryStatusLabel = ["No Info", "Registered", "At Hub", "Planned", "In Delivery", "Arrived", "Delivered"];
const flightStateLabel = ["PreFlight", "Canceled", "Flying", "Paused", "Aborted", "Ended"];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    const result = Math.floor(Math.random() * (max - min + 1)) + min;

    return result;
}

async function createAccesses() {
    console.log("##############################");
    console.log("# 1) Create Accesses");
    console.log("##############################");
    const rolePilot = await swAccessControlContract.connect(adminWallet).PILOT_ROLE();
    const roleDrone = await swAccessControlContract.connect(adminWallet).DRONE_ROLE();

    for (const pilotData of simulatorData.pilots) {
        console.log(`Creating Pilot: ${pilotData.name} (${pilotData.address})...`);
        await starwingsMasterContract.connect(adminWallet).addPilot(pilotData.address, pilotData.name);
        await swAccessControlContract.connect(adminWallet).grantRole(rolePilot, pilotData.address);
    }

    for (const droneData of simulatorData.drones) {
        console.log(`Creating Drone (ID/Type): ${droneData.id}/${droneData.type} (${droneData.address})...`);
        await starwingsMasterContract.connect(adminWallet).addDrone(droneData.address, droneData.id, droneData.type);
        await swAccessControlContract.connect(adminWallet).grantRole(roleDrone, droneData.address);
    }

    pilot1 = await starwingsMasterContract.connect(pilot1Wallet).getPilot(pilot1Wallet.address);
    pilot2 = await starwingsMasterContract.connect(pilot2Wallet).getPilot(pilot2Wallet.address);
    drone1 = await starwingsMasterContract.connect(pilot1Wallet).getDrone(drone1Wallet.address);
    drone2 = await starwingsMasterContract.connect(pilot2Wallet).getDrone(drone2Wallet.address);
}

async function createDeliveries() {
    console.log("##############################");
    console.log("# 2) Create Deliveries");
    console.log("##############################");

    for (const deliveryData of simulatorData.deliveries) {
        console.log(`Creating Delivery (Order ID): ${deliveryData.supplierOrderId}...`);
        await deliveryManagerContract.connect(adminWallet).newDelivery(deliveryData);
    }
}

async function createConops() {
    console.log("##############################");
    console.log("# 3) Create CONOPS");
    console.log("##############################");

    for (const conopsData of simulatorData.conopsList) {
        console.log(`Creating CONOPS: ${conopsData.name}...`);
        await conopsManagerContract
            .connect(adminWallet)
            .addConops(
                conopsData.name,
                conopsData.startingPoint,
                conopsData.endPoint,
                conopsData.crossRoad,
                conopsData.exclusionZone,
                conopsData.airRisks,
                conopsData.grc,
                conopsData.arc
            );
    }
}

async function createDroneDeliveries() {
    console.log("##############################");
    console.log("# 4) Create DroneDeliveries");
    console.log("##############################");

    const deliveries = await deliveryManagerContract.connect(pilot1Wallet).getAllDeliveries();
    const conopsList = await conopsManagerContract.connect(pilot1Wallet).viewAllConops();

    // Delivery 1
    const delivery1 = deliveries[2];
    const conopsId1 = 2;
    const conops1 = conopsList[conopsId1];
    const droneDelivery1 = {
        pilot: pilot1,
        drone: drone1,
        conopsId: conopsId1,
        flightDatetime: new Date().getTime(),
        flightDuration: 1,
        depart: conops1.startingPoint,
        destination: conops1.endPoint,
    };
    const droneDeliveryContract1 = await getDroneDeliveryContract(
        pilot1Wallet,
        delivery1.deliveryId,
        droneDelivery1,
        conops1
    );

    // Delivery 2
    const delivery2 = deliveries[3];
    const conopsId2 = 3;
    const conops2 = conopsList[conopsId2];
    const droneDelivery2 = {
        pilot: pilot2,
        drone: drone2,
        conopsId: conopsId2,
        flightDatetime: new Date().getTime(),
        flightDuration: 2,
        depart: conops2.startingPoint,
        destination: conops2.endPoint,
    };
    const droneDeliveryContract2 = await getDroneDeliveryContract(
        pilot2Wallet,
        delivery2.deliveryId,
        droneDelivery2,
        conops2
    );

    console.log("##############################");
    console.log("# 5) Simule Flight");
    console.log("##############################");
    await simuleFlight(pilot1Wallet, drone1Wallet, droneDeliveryContract1, delivery1.deliveryId);
    console.log("##############################");
    await simuleFlight(pilot2Wallet, drone2Wallet, droneDeliveryContract2, delivery2.deliveryId);
}

async function getDroneDeliveryContract(pilotWallet, deliveryId, droneDeliveryData, conops) {
    console.log(`Creating Drone Delivery for Delivery ID#${deliveryId} / Pilot ${pilotWallet.address}...`);
    const salt = Date.now();
    const droneDeliveryArtifact = await hardhat.ethers.getContractFactory("DroneDelivery");
    const bytecode = hardhat.ethers.utils.arrayify(
        hardhat.ethers.utils.hexConcat([
            droneDeliveryArtifact.bytecode,
            droneDeliveryArtifact.interface.encodeDeploy([
                deliveryManagerContractAddress,
                deliveryId,
                conopsManagerContractAddress,
                swAccessControlContractAddress,
                starwingsMasterContractAddress,
            ]),
        ])
    );
    const result = await droneFlightFactoryContract.connect(pilotWallet).deploy(bytecode, salt, {
        gasLimit: 9000000,
    });
    const temp = await result.wait();
    const droneDeliveryContractAddress = temp.events?.filter((x) => {
        return x.event === "Deployed";
    })[0].args.addr;
    const droneDeliveryContract = new ethers.Contract(droneDeliveryContractAddress, droneDeliveryArtifact.interface);
    await droneDeliveryContract.connect(pilotWallet).initDelivery(droneDeliveryData);
    console.log(`Validating Drone Delivery ID#${deliveryId} Air Risks...`);

    for (let i = 0; i < conops.airRiskList.length; i++) {
        await droneDeliveryContract.connect(pilotWallet).validateAirRisk(i);
    }

    return droneDeliveryContract;
}

async function simuleFlight(pilotWallet, droneWallet, droneDeliveryContract, deliveryId) {
    // Pre-flight checks
    await droneDeliveryContract.connect(pilotWallet).preFlightChecks(0);
    console.log(`DeliveryID ${deliveryId}: Pre-flight Check motor OK`);
    await sleep(3000);
    await droneDeliveryContract.connect(pilotWallet).preFlightChecks(1);
    console.log(`DeliveryID ${deliveryId}: Pre-flight Check battery OK`);
    await sleep(3000);
    await droneDeliveryContract.connect(pilotWallet).preFlightChecks(2);
    console.log(`DeliveryID ${deliveryId}: Pre-flight Check control station OK`);
    await sleep(3000);

    // Pick-up parcel
    await droneDeliveryContract.connect(droneWallet).pickUp();
    console.log(`DeliveryID ${deliveryId}: Parcel picked up OK`);
    await sleep(3000);

    // Change Status to Flying
    let pilotFlightStatus = await droneDeliveryContract.connect(pilotWallet).viewPilotFlightstatus();
    let droneFlightStatus = await droneDeliveryContract.connect(pilotWallet).viewDroneFlightstatus();
    console.log(`DeliveryID ${deliveryId}: Pilot Flight Status ${flightStateLabel[pilotFlightStatus]}`);
    console.log(`DeliveryID ${deliveryId}: Drone Flight Status ${flightStateLabel[droneFlightStatus]}`);
    await droneDeliveryContract.connect(pilotWallet).changeFlightStatus(2);
    await droneDeliveryContract.connect(droneWallet).changeFlightStatus(2);
    await sleep(3000);
    pilotFlightStatus = await droneDeliveryContract.connect(pilotWallet).viewPilotFlightstatus();
    droneFlightStatus = await droneDeliveryContract.connect(pilotWallet).viewDroneFlightstatus();
    console.log(`DeliveryID ${deliveryId}: Pilot Flight Status ${flightStateLabel[pilotFlightStatus]}`);
    console.log(`DeliveryID ${deliveryId}: Drone Flight Status ${flightStateLabel[droneFlightStatus]}`);

    // Checkpoints
    for (let i = 0; i < 10; i++) {
        const time = new Date().getTime();
        const latitude = getRandomInt(1, 100);
        const longitude = getRandomInt(1, 100);
        await droneDeliveryContract.connect(droneWallet).addCheckpoint(time, {
            latitude: latitude,
            longitude: longitude,
        });
        console.log(
            `DeliveryID ${deliveryId}: Adding checkpoint time(${time}); latitude:${latitude}; longitude:${longitude}`
        );
    }

    // newRiskEvent(Event memory _event)
    // viewRiskEvent(uint256 _eventId)
    // cancelFlight

    // Deliver parcel
    await droneDeliveryContract.connect(droneWallet).deliver();
    console.log(`DeliveryID ${deliveryId}: Parcel delivered OK`);
    await sleep(3000);

    // Change Status to Ended
    await droneDeliveryContract.connect(pilotWallet).changeFlightStatus(5);
    await droneDeliveryContract.connect(droneWallet).changeFlightStatus(5);
    pilotFlightStatus = await droneDeliveryContract.connect(pilotWallet).viewPilotFlightstatus();
    droneFlightStatus = await droneDeliveryContract.connect(pilotWallet).viewDroneFlightstatus();
    console.log(`DeliveryID ${deliveryId}: Pilot Flight Status ${flightStateLabel[pilotFlightStatus]}`);
    console.log(`DeliveryID ${deliveryId}: Drone Flight Status ${flightStateLabel[droneFlightStatus]}`);
    await sleep(3000);

    // Post-flight checks
    await droneDeliveryContract.connect(pilotWallet).postFlightChecks(0);
    console.log(`DeliveryID ${deliveryId}: Post-flight Check motor OK`);
    await sleep(3000);
    await droneDeliveryContract.connect(pilotWallet).postFlightChecks(1);
    console.log(`DeliveryID ${deliveryId}: Post-flight Check battery OK`);
    await sleep(3000);
    await droneDeliveryContract.connect(pilotWallet).postFlightChecks(2);
    console.log(`DeliveryID ${deliveryId}: Post-flight Check control station OK`);
    await sleep(3000);
}

async function main() {
    try {
        await createAccesses();
        await createDeliveries();
        await createConops();
        await createDroneDeliveries();
    } catch (error) {
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
