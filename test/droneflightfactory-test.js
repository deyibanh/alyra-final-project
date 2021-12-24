const { expect } = require("chai");
const { ethers } = require("hardhat");

let factory,
    accessControl,
    starwingsMaster,
    conops,
    delivery,
    owner,
    pilot,
    drone;

const droneFlightDataSample = {
    piloteAddr: "",
    droneAddr: "",
    conopsId: 4,
    flightDatetime: 57875,
    flightDuration: 10,
    pilotName: "john",
    droneType: "azer",
    droneId: "45",
    depart: "Terre",
    destination: "Moon",
};

const deploy = async () => {
    [owner, pilot, drone] = await ethers.getSigners();
    droneFlightDataSample.piloteAddr = pilot.address;
    droneFlightDataSample.droneAddr = drone.address;

    const AccessControl = await ethers.getContractFactory("SWAccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.deployed();
    const roleAdmin = await accessControl.ADMIN_ROLE();
    const rolePilot = await accessControl.PILOT_ROLE();
    const roleDrone = await accessControl.DRONE_ROLE();
    await accessControl.grantRole(roleAdmin, owner.address);
    await accessControl.grantRole(rolePilot, pilot.address);
    await accessControl.grantRole(roleDrone, drone.address);

    const Conops = await ethers.getContractFactory("ConopsManager");
    conops = await Conops.deploy(accessControl.address);
    await conops.deployed();

    const Delivery = await ethers.getContractFactory("DeliveryManager");
    delivery = await Delivery.deploy(accessControl.address);
    await delivery.deployed();

    const StarwingsMaster = await ethers.getContractFactory("StarwingsMaster");
    starwingsMaster = await StarwingsMaster.deploy(
        accessControl.address,
        conops.address,
        delivery.address
    );

    const Factory = await ethers.getContractFactory("DroneFlightFactory");
    factory = await Factory.deploy(
        accessControl.address,
        starwingsMaster.address
    );
    await factory.deployed();

    await starwingsMaster.setDroneFlightFactoryAddress(factory.address);
    return [factory, accessControl];
};

describe("DroneFlightFactory", function () {
    beforeEach(async () => {
        await deploy();
    });

    it("Should revert due to caller not pilot", async () => {
        expect((await factory.getDeployedContracts()).length).to.equal(0);
        await expect(
            factory.connect(owner).newDroneDelivery(0, droneFlightDataSample)
        ).to.be.revertedWith("you don't have the role");
    });

    it("Should deploy 2 new DroneDelivery contract", async () => {
        expect((await factory.getDeployedContracts()).length).to.equal(0);
        const addDroneDeliveryTx = await factory
            .connect(pilot)
            .newDroneDelivery(44, droneFlightDataSample);

        await addDroneDeliveryTx.wait();

        expect((await factory.getDeployedContracts()).length).to.equal(1);
        expect(await factory.deployedContracts(0)).to.not.equal(0);

        const addDroneDeliveryTx2 = await factory
            .connect(pilot)
            .newDroneDelivery(57, droneFlightDataSample);
        await addDroneDeliveryTx2.wait();

        // Verify Contract Addresses creation
        const addressesFromFactory = await factory.getDeployedContracts();

        expect((await factory.getDeployedContracts()).length).to.equal(2);
        expect(addressesFromFactory[0]).to.not.equal(0);
        expect(addressesFromFactory[1]).to.not.equal(0);
        expect(addressesFromFactory[0]).to.not.equal(addressesFromFactory[1]);

        const addressesFromStarwingsMaster =
            await starwingsMaster.getDroneFlightAddressList();

        expect(addressesFromFactory).to.be.eql(addressesFromStarwingsMaster);

        // Verify contracts deployement
        const DroneDelivery = await ethers.getContractFactory("DroneDelivery");
        const droneDelivery0 = await DroneDelivery.attach(
            addressesFromFactory[0]
        );
        const droneDelivery1 = await DroneDelivery.attach(
            addressesFromFactory[1]
        );

        expect(await droneDelivery0.getDeliveryId()).to.be.equal(44);
        expect(await droneDelivery1.getDeliveryId()).to.be.equal(57);
    });
});
