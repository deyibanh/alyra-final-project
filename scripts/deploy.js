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

    const rolePilot = await SWAccessControl.PILOT_ROLE();
    const roleDrone = await SWAccessControl.DRONE_ROLE();

    // Pilot 1
    await StarwingsMaster.addPilot(
        "0x80F528b2d0F010fC1cF85D98a3050b3f6194BD61",
        "Joanna"
    );

    await SWAccessControl.grantRole(
        rolePilot,
        "0x80F528b2d0F010fC1cF85D98a3050b3f6194BD61"
    );

    // Pilot 2
    await StarwingsMaster.addPilot(
        "0x9FAB777bb961d2db84e1f4b3D27A165B88aC015f",
        "Florian"
    );

    await SWAccessControl.grantRole(
        rolePilot,
        "0x9FAB777bb961d2db84e1f4b3D27A165B88aC015f"
    );

    // Drone 1
    await StarwingsMaster.addDrone(
        "0x86b6946BE885ba92e1D8BE3d9D3Ce257EeaB8215",
        "UAS-FR-239271",
        "DJI Matrice 600 Pro"
    );

    await SWAccessControl.grantRole(
        roleDrone,
        "0x86b6946BE885ba92e1D8BE3d9D3Ce257EeaB8215"
    );

    // Drone 2
    await StarwingsMaster.addDrone(
        "0xBfD3358f360143885409b9a3cC84E3831C113D5e",
        "UAS-FR-170981",
        "Vertix"
    );

    await SWAccessControl.grantRole(
        roleDrone,
        "0xBfD3358f360143885409b9a3cC84E3831C113D5e"
    );

    // Delivery 1
    await DeliveryManager.newDelivery({
        deliveryId: "",
        supplierOrderId: "O798325",
        state: 0,
        from: "Pharmacie Le Tertre",
        fromAddr: "0x96aA1dEc85E3F454FC1F9A196faB2AC33b554f9B",
        to: "Francois Brobeck",
        toAddr: "0x2042f92fc8B323E0F3FC05173ec96269475f819e",
        fromHubId: 100,
        toHubId: 300,
    });

    // Delivery 2
    await DeliveryManager.newDelivery({
        deliveryId: "",
        supplierOrderId: "O312607",
        state: 0,
        from: "Pharmacie Le Tertre",
        fromAddr: "0x96aA1dEc85E3F454FC1F9A196faB2AC33b554f9B",
        to: "Jean-Philippe BONHOMME",
        toAddr: "0x7169D3cBb875e97Ad8966402A3b1af7Dc8f4F57f",
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
