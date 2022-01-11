// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy

    // Access control
    const SWAccessControlArtifact = await hre.ethers.getContractFactory(
        "SWAccessControl"
    );
    const ConopsManagerArtifact = await hre.ethers.getContractFactory(
        "ConopsManager"
    );
    const DeliveryManagerArtifact = await hre.ethers.getContractFactory(
        "DeliveryManager"
    );
    const StarwingsMasterArtifact = await hre.ethers.getContractFactory(
        "StarwingsMaster"
    );

    const DroneFlightFactoryArtifact = await hre.ethers.getContractFactory(
        "DroneFlightFactory"
    );

    const SWAccessControl = await SWAccessControlArtifact.deploy();
    await SWAccessControl.deployed();

    console.log("SWAccessControl deployed to:", SWAccessControl.address);

    const ConopsManager = await ConopsManagerArtifact.deploy(
        SWAccessControl.address
    );
    const DeliveryManager = await DeliveryManagerArtifact.deploy(
        SWAccessControl.address
    );
    await ConopsManager.deployed();
    await DeliveryManager.deployed();
    console.log("ConopsManager deployed to:", ConopsManager.address);
    console.log("DeliveryManager deployed to:", DeliveryManager.address);

    const StarwingsMaster = await StarwingsMasterArtifact.deploy(
        SWAccessControl.address,
        ConopsManager.address,
        DeliveryManager.address
    );

    await StarwingsMaster.deployed();
    console.log("StarwingsMaster deployed to:", StarwingsMaster.address);

    const DroneFlightFactory = await DroneFlightFactoryArtifact.deploy(
        SWAccessControl.address,
        StarwingsMaster.address
    );

    await DroneFlightFactory.deployed();
    console.log("DroneFlightFactory deployed to:", DroneFlightFactory.address);

    StarwingsMaster.setDroneFlightFactoryAddress(DroneFlightFactory.address);

    const contractAddresses = {
        SWAccessControl: SWAccessControl.address,
        StarwingsMaster: StarwingsMaster.address,
        ConopsManager: ConopsManager.address,
        DeliveryManager: DeliveryManager.address,
        DroneFlightFactory: DroneFlightFactory.address,
    };

    // Store contracts addresses for client
    storeContractAddresses(contractAddresses);

    /**
     * Test actors *
     *
     * Admin   : 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (Acct0)
     * Pilot 1 : 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (Acct1)
     * Pilot 2 : 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (Acct2)
     * Drone 1 : 0x90f79bf6eb2c4f870365e785982e1f101e93b906 (Acct3)
     * Drone 2 : 0x15d34aaf54267db7d7c367839aaf71a00a2c6a65 (Acct4)
     *
     * Deliveries *
     *
     * From : Pharmacie Le Tertre (0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc) (Acct5)
     * To : Francois Brobeck (0x976ea74026e726554db657fa54763abd0c3a0aa9) (Acct6)
     *
     * From : Pharmacie Le Tertre (0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc) (Acct5)
     * To : Jean-Philippe BONHOMME (0x14dc79964da2c08b23698b3d3cc7ca32193d9955) (Acct7)
     *
     * Conops *
     *
     *
     */

    const rolePilot = await SWAccessControl.PILOT_ROLE();
    const roleDrone = await SWAccessControl.DRONE_ROLE();

    // Pilot 1
    await StarwingsMaster.addPilot(
        "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "Joanna"
    );

    SWAccessControl.grantRole(
        rolePilot,
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );

    // Pilot 2
    await StarwingsMaster.addPilot(
        "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
        "Florian"
    );

    SWAccessControl.grantRole(
        rolePilot,
        "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
    );

    // Drone 1
    await StarwingsMaster.addDrone(
        "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
        "UAS-FR-239271",
        "DJI Matrice 600 Pro"
    );

    SWAccessControl.grantRole(
        roleDrone,
        "0x90f79bf6eb2c4f870365e785982e1f101e93b906"
    );

    // Drone 2
    await StarwingsMaster.addDrone(
        "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
        "UAS-FR-170981",
        "Vertix"
    );

    SWAccessControl.grantRole(
        roleDrone,
        "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65"
    );

    // Delivery 1
    await DeliveryManager.newDelivery({
        deliveryId: "",
        supplierOrderId: "O798325",
        state: 0,
        from: "Pharmacie Le Tertre",
        fromAddr: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
        to: "Francois Brobeck",
        toAddr: "0x976ea74026e726554db657fa54763abd0c3a0aa9",
        fromHubId: 100,
        toHubId: 300,
    });

    // Delivery 2
    await DeliveryManager.newDelivery({
        deliveryId: "",
        supplierOrderId: "O312607",
        state: 0,
        from: "Pharmacie Le Tertre",
        fromAddr: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
        to: "Jean-Philippe BONHOMME",
        toAddr: "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
        fromHubId: 100,
        toHubId: 700,
    });

    // Conops 1
    await ConopsManager.addConops(
        "Villedieu 3 km", // name
        "HUB Villedieu-Sur-Indre", // startingPoint
        "HUB Chambon", // endPoint
        "None", // crossRoad
        "None", // exclusionZone
        [
            { validated: false, name: "Aerodrome 1", riskType: 0 },
            { validated: false, name: "CHU 1", riskType: 1 },
        ],
        4, // grc
        0 // arc
    );

    // Conops 1
    await ConopsManager.addConops(
        "Villedieu 7 km", // name
        "HUB Villedieu-Sur-Indre", // startingPoint
        "HUB La Chapelle Orthemale", // endPoint
        "None", // crossRoad
        "None", // exclusionZone
        [
            { validated: false, name: "Aerodrome 1", riskType: 0 },
            { validated: false, name: "MilitaryBase 1", riskType: 2 },
        ],
        4, // grc
        0 // arc
    );
}

const storeContractAddresses = (jsonData) => {
    const fs = require("fs");

    fs.writeFileSync(
        "./client/src/contractAddresses.json",
        JSON.stringify(jsonData),
        function (err) {
            if (err) {
                console.log(err);
            }
        }
    );
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
