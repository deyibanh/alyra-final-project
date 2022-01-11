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

    const rolePilot = await SWAccessControl.PILOT_ROLE();
    SWAccessControl.grantRole(
        rolePilot,
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );

    StarwingsMaster.setDroneFlightFactoryAddress(DroneFlightFactory.address);

    const contractAddresses = {
        SWAccessControl: SWAccessControl.address,
        StarwingsMaster: StarwingsMaster.address,
        ConopsManager: ConopsManager.address,
        DeliveryManager: DeliveryManager.address,
        DroneFlightFactory: DroneFlightFactory.address,
    };

    storeContractAddresses(contractAddresses);
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
