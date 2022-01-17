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
     * Admin   : 0x74b890e6ADbBF8770904aA4d258760a755b43FE6 (0)
     * Pilot 1 : 0x80F528b2d0F010fC1cF85D98a3050b3f6194BD61 (2)
     * Pilot 2 : 0x9FAB777bb961d2db84e1f4b3D27A165B88aC015f (3)
     * Drone 1 : 0x86b6946BE885ba92e1D8BE3d9D3Ce257EeaB8215 (4)
     * Drone 2 : 0xBfD3358f360143885409b9a3cC84E3831C113D5e (5)
     *
     * Deliveries *
     *
     * From : Pharmacie Le Tertre (0x96aA1dEc85E3F454FC1F9A196faB2AC33b554f9B) (8)
     * To : Francois Brobeck (0x2042f92fc8B323E0F3FC05173ec96269475f819e) (6)
     *
     * From : Pharmacie Le Tertre (0x96aA1dEc85E3F454FC1F9A196faB2AC33b554f9B) (8)
     * To : Jean-Philippe BONHOMME (0x7169D3cBb875e97Ad8966402A3b1af7Dc8f4F57f) (7)
     *
     * Conops *
     *
     *
     */
    const [owner, dummy, pilot1, pilot2, drone1, drone2, to1, to2, from] =
        await hre.ethers.getSigners();

    const rolePilot = await SWAccessControl.PILOT_ROLE();
    const roleDrone = await SWAccessControl.DRONE_ROLE();

    console.log("######## Create Sample data");

    // Pilot 1
    await StarwingsMaster.addPilot(pilot1.address, "Joanna");
    await SWAccessControl.grantRole(rolePilot, pilot1.address);

    console.log("### Pilot 1 added");

    // Pilot 2
    await StarwingsMaster.addPilot(pilot2.address, "Florian");
    await SWAccessControl.grantRole(rolePilot, pilot2.address);

    console.log("### Pilot 2 added");

    // Drone 1
    await StarwingsMaster.addDrone(
        drone1.address,
        "UAS-FR-239271",
        "DJI Matrice 600 Pro"
    );

    await SWAccessControl.grantRole(roleDrone, drone1.address);

    console.log("### Drone 1 added");

    // Drone 2
    await StarwingsMaster.addDrone(drone2.address, "UAS-FR-170981", "Vertix");
    await SWAccessControl.grantRole(roleDrone, drone2.address);

    console.log("### Drone 2 added");

    // Delivery 1
    await DeliveryManager.newDelivery({
        deliveryId: "",
        supplierOrderId: "O798325",
        state: 0,
        from: "Pharmacie Le Tertre",
        fromAddr: from.address,
        to: "Francois Brobeck",
        toAddr: to1.address,
        fromHubId: 100,
        toHubId: 300,
    });

    console.log("### Delivery 1 added");

    // Delivery 2
    await DeliveryManager.newDelivery({
        deliveryId: "",
        supplierOrderId: "O312607",
        state: 0,
        from: "Pharmacie Le Tertre",
        fromAddr: from.address,
        to: "Jean-Philippe BONHOMME",
        toAddr: to2.address,
        fromHubId: 100,
        toHubId: 700,
    });

    console.log("### Delivery 2 added");

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

    console.log("### Conops 1 added");

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

    console.log("### Conops 2 added");

    console.log("########### DONE !");

    // if (hre.network.name === "optimism_testnet") {
    //     console.log("### Verifying contracts in 10 secs ###");
    //     sleep(10000);
    //     if (!(await isContractVerified(SWAccessControl.address))) {
    //         await hre.run("verify:verify", {
    //             address: SWAccessControl.address,
    //             constructorArguments: [],
    //         });
    //     }

    //     if (!(await isContractVerified(ConopsManager.address))) {
    //         await hre.run("verify:verify", {
    //             address: ConopsManager.address,
    //             constructorArguments: [SWAccessControl.address],
    //         });
    //     }

    //     if (!(await isContractVerified(DeliveryManager.address))) {
    //         console.log("dee");
    //         await hre.run("verify:verify", {
    //             address: DeliveryManager.address,
    //             constructorArguments: [SWAccessControl.address],
    //         });
    //     }

    //     if (!(await isContractVerified(StarwingsMaster.address))) {
    //         await hre.run("verify:verify", {
    //             address: StarwingsMaster.address,
    //             constructorArguments: [
    //                 SWAccessControl.address,
    //                 ConopsManager.address,
    //                 DeliveryManager.address,
    //             ],
    //         });
    //     }

    //     if (!(await isContractVerified(DroneFlightFactory.address))) {
    //         await hre.run("verify:verify", {
    //             address: DroneFlightFactory.address,
    //             constructorArguments: [
    //                 SWAccessControl.address,
    //                 StarwingsMaster.address,
    //             ],
    //         });
    //     }
    // }
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

// const isContractVerified = async (address) => {
//     const getJSON = require("get-json");

//     const path =
//         "https://api-kovan-optimistic.etherscan.io/api?module=contract&action=getABI&address=" +
//         address;
//     let status;
//     await getJSON(path, function (error, response) {
//         const state = JSON.parse(response.status);
//         if (error) {
//             console.log(error);
//         }
//         if (state === 1) {
//             status = true;
//         } else {
//             status = false;
//         }
//     });
//     return status;
// };

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
