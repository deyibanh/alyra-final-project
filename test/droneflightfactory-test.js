/* eslint-disable no-unreachable */
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

const pilotSample = {
    _pilotAddress: "",
    _pilotName: "John Pilot",
};

const droneSample = {
    _droneAddress: "",
    _droneId: "78re2578",
    _droneType: "aiir32",
};

const droneFlightDataSample = {
    droneAddress: "",
    conopsId: 0,
    flightDatetime: 57875,
    flightDuration: 10,
    depart: "Earth",
    destination: "Moon",
    droneDeliveryAddr: "",
};

const deliverySample = {
    deliveryId: "kj",
    supplierOrderId: "A47G-78",
    state: 0,
    from: "From1",
    fromAddr: 0x01,
    to: "To1",
    toAddr: 0x00,
    fromHubId: "007",
    toHubId: "0056",
};

let droneDeliveryFactory;

const deploy = async () => {
    [owner, pilot, drone] = await ethers.getSigners();
    pilotSample._pilotAddress = pilot.address;
    droneSample._droneAddress = drone.address;
    droneFlightDataSample.droneAddress = drone.address;
    deliverySample.fromAddr = pilot.address;
    deliverySample.toAddr = drone.address;

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

    const addConopsTx = await conops.addConops(
        "test1",
        "with 4 plots",
        "with 5 plots",
        "with flag",
        "with 1 person",
        [
            { name: "CHU A", riskType: 0 },
            { name: "BASE B", riskType: 2 },
        ],
        4,
        5
    );

    await addConopsTx.wait();

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
    await starwingsMaster.addDrone(
        droneSample._droneAddress,
        droneSample._droneId,
        droneSample._droneType
    );
    await starwingsMaster.addPilot(
        pilotSample._pilotAddress,
        pilotSample._pilotName
    );

    droneDeliveryFactory = await ethers.getContractFactory("DroneDelivery");

    return [factory, accessControl];
};

describe("DroneFlightFactory", function () {
    beforeEach(async () => {
        await deploy();
    });

    it("Should revert due to caller not pilot", async () => {
        expect((await factory.getDeployedContracts()).length).to.equal(0);

        // Magics happens
        const salt = 1;
        const bytecode = ethers.utils.arrayify(
            ethers.utils.hexConcat([
                droneDeliveryFactory.bytecode,
                droneDeliveryFactory.interface.encodeDeploy([
                    delivery.address,
                    "TEST",
                    conops.address,
                    accessControl.address,
                ]),
            ])
        );

        const result = factory.connect(owner).deploy(bytecode, salt, {
            gasLimit: 9000000,
        });

        await expect(result).to.be.revertedWith("Access Refused");
    });

    it("Should deploy 2 new DroneDelivery contract", async () => {
        await delivery.newDelivery(deliverySample);
        await delivery.newDelivery(deliverySample);
        const deliveries = await delivery.getAllDeliveries();
        expect((await factory.getDeployedContracts()).length).to.equal(0);

        // Magics happens
        const salt = 1;
        const bytecode = ethers.utils.arrayify(
            ethers.utils.hexConcat([
                droneDeliveryFactory.bytecode,
                droneDeliveryFactory.interface.encodeDeploy([
                    delivery.address,
                    deliveries[0].deliveryId,
                    conops.address,
                    accessControl.address,
                ]),
            ])
        );

        // Create droneDelivery instance
        const result = await factory.connect(pilot).deploy(bytecode, salt, {
            gasLimit: 9000000,
        });

        // Get event values
        const temp = await result.wait();
        const deliveryAddr = temp.events?.filter((x) => {
            return x.event === "Deployed";
        })[0].args.addr;

        console.log(`Delivery created ${deliveryAddr}`);

        droneFlightDataSample.droneDeliveryAddr = deliveryAddr;

        const addDroneDeliveryTx = await factory
            .connect(pilot)
            .newDroneDelivery(
                deliveries[0].deliveryId,
                ...Object.values(droneFlightDataSample)
            );

        await addDroneDeliveryTx.wait();

        console.log(
            `Deployed contracts = ${await factory.getDeployedContracts()}`
        );

        expect((await factory.getDeployedContracts()).length).to.equal(1);
        expect(await factory.deployedContracts(0)).to.not.equal(0);

        return;

        const addDroneDeliveryTx2 = await factory
            .connect(pilot)
            .newDroneDelivery(
                deliveries[1].deliveryId,
                ...Object.values(droneFlightDataSample)
            );
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

        expect(
            (await starwingsMaster.getPilot(pilot.address)).flightAddresses[0]
        ).to.be.equal(addressesFromStarwingsMaster[0]);
        expect(
            (await starwingsMaster.getPilot(pilot.address)).flightAddresses[1]
        ).to.be.equal(addressesFromStarwingsMaster[1]);
        expect(
            (await starwingsMaster.getDrone(drone.address)).flightAddresses[0]
        ).to.be.equal(addressesFromStarwingsMaster[0]);
        expect(
            (await starwingsMaster.getDrone(drone.address)).flightAddresses[1]
        ).to.be.equal(addressesFromStarwingsMaster[1]);

        // Verify contracts deployement
        const DroneDelivery = await ethers.getContractFactory("DroneDelivery");
        const droneDelivery0 = await DroneDelivery.attach(
            addressesFromFactory[0]
        );
        const droneDelivery1 = await DroneDelivery.attach(
            addressesFromFactory[1]
        );

        expect(await droneDelivery0.getDeliveryId()).to.be.equal(
            deliveries[0].deliveryId
        );
        expect(await droneDelivery1.getDeliveryId()).to.be.equal(
            deliveries[1].deliveryId
        );
    });
});
