const hre = require("hardhat");
const contracts = require("../client/src/contractAddresses.json");

async function main() {
    if (hre.network.name === "optimism_testnet") {
        console.log("### Verifying contracts.... ###");

        if (!(await isContractVerified(contracts.SWAccessControl))) {
            console.log("SWAccessControl not verified ! Verifying....");
            await hre.run("verify:verify", {
                address: contracts.SWAccessControl,
                constructorArguments: [],
            });
        }

        if (!(await isContractVerified(contracts.ConopsManager))) {
            console.log("ConopsManager not verified ! Verifying....");
            await hre.run("verify:verify", {
                address: contracts.ConopsManager,
                constructorArguments: [contracts.SWAccessControl],
            });
        }

        if (!(await isContractVerified(contracts.DeliveryManager))) {
            console.log("DeliveryManager not verified ! Verifying....");
            await hre.run("verify:verify", {
                address: contracts.DeliveryManager,
                constructorArguments: [contracts.SWAccessControl],
            });
        }

        if (!(await isContractVerified(contracts.StarwingsMaster))) {
            console.log("StarwingsMaster not verified ! Verifying....");
            await hre.run("verify:verify", {
                address: contracts.StarwingsMaster,
                constructorArguments: [contracts.SWAccessControl, contracts.ConopsManager, contracts.DeliveryManager],
            });
        }

        if (!(await isContractVerified(contracts.DroneFlightFactory))) {
            console.log("DroneFlightFactory not verified ! Verifying....");
            await hre.run("verify:verify", {
                address: contracts.DroneFlightFactory,
                constructorArguments: [contracts.SWAccessControl, contracts.StarwingsMaster],
            });
        }
    }
}

const isContractVerified = async (address) => {
    const getJSON = require("get-json");

    const path = "https://api-kovan-optimistic.etherscan.io/api?module=contract&action=getABI&address=" + address;
    let status;
    await getJSON(path, function (error, response) {
        const state = JSON.parse(response.status);
        if (error) {
            console.log(error);
        }
        if (state === 1) {
            status = true;
        } else {
            status = false;
        }
    });
    return status;
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
