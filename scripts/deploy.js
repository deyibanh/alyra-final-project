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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
