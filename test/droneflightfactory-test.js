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
    pilot2,
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
    pilot: {
        index: 0,
        isDeleted: false,
        name: "",
        pilotAddress: "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
        flightAddresses: [],
    },
    drone: {
        index: 0,
        isDeleted: false,
        droneId: "",
        droneType: "",
        droneAddress: "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
        flightAddresses: [],
    },
    conopsId: 0,
    flightDatetime: 0,
    flightDuration: 0,
    depart: "",
    destination: "",
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
    [owner, pilot, pilot2, drone] = await ethers.getSigners();
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

    droneSample._droneAddress = drone.address;
    // console.log(`======= Adding Drone [${droneSample._droneAddress}]`);

    await starwingsMaster.addDrone(
        droneSample._droneAddress,
        droneSample._droneId,
        droneSample._droneType
    );
    pilotSample._pilotAddress = pilot.address;

    // console.log(`======= Adding Pilot [${pilotSample._pilotAddress}]`);

    await starwingsMaster.addPilot(
        pilotSample._pilotAddress,
        pilotSample._pilotName
    );

    droneDeliveryFactory = await ethers.getContractFactory("DroneDelivery");

    return [factory, accessControl];
};

describe("DroneFlightFactory", function () {
    before(async () => {
        await deploy();
    });

    it("should revert due to caller not pilot", async () => {
        expect((await factory.getDeployedContracts()).length).to.equal(0);

        // Magics happens
        const salt = Date.now();
        const bytecode = ethers.utils.arrayify(
            ethers.utils.hexConcat([
                droneDeliveryFactory.bytecode,
                droneDeliveryFactory.interface.encodeDeploy([
                    delivery.address,
                    "TEST",
                    conops.address,
                    accessControl.address,
                    starwingsMaster.address,
                ]),
            ])
        );

        const result = factory.connect(owner).deploy(bytecode, salt, {
            gasLimit: 9000000,
        });

        await expect(result).to.be.revertedWith("Access Refused");
    });

    it("should deploy 2 new DroneDelivery contract", async () => {
        await delivery.newDelivery(deliverySample);
        await delivery.newDelivery(deliverySample);

        const deliveries = await delivery.getAllDeliveries();
        expect((await factory.getDeployedContracts()).length).to.equal(0);

        // ############################ 1st DroneDelivery
        // // console.log("############################ 1st DroneDelivery");
        // Magics happens
        let salt = 1;
        let bytecode = ethers.utils.arrayify(
            ethers.utils.hexConcat([
                droneDeliveryFactory.bytecode,
                droneDeliveryFactory.interface.encodeDeploy([
                    delivery.address,
                    deliveries[0].deliveryId,
                    conops.address,
                    accessControl.address,
                    starwingsMaster.address,
                ]),
            ])
        );

        // Create droneDelivery instance
        let result = await factory.connect(pilot).deploy(bytecode, salt, {
            gasLimit: 9000000,
        });

        // Get event values
        let temp = await result.wait();
        let droneDeliveryAddr = temp.events?.filter((x) => {
            return x.event === "Deployed";
        })[0].args.addr;

        // console.log(`[DroneDelivery] deployed at ${droneDeliveryAddr}`);
        // console.log(`[DeliveryId] used ${deliveries[0].deliveryId}`);

        // Create contract object with deployed address
        let droneDeliveryContract = new ethers.Contract(
            droneDeliveryAddr,
            droneDeliveryFactory.interface,
            pilot
        );

        // console.log(
        //     `[Verifiy] DeliveryId in DroneDelivery = ${await droneDeliveryContract.getDeliveryId()}`
        // );

        // Init flightdata for drone delivery
        droneFlightDataSample.pilot.pilotAddress = pilot.address;
        droneFlightDataSample.drone.droneAddress = drone.address;
        await droneDeliveryContract
            .connect(pilot)
            .initDelivery(droneFlightDataSample);

        // console.log(
        //     `Deployed contracts = ${
        //         (await factory.getDeployedContracts()).length
        //     }`
        // );

        expect((await factory.getDeployedContracts()).length).to.equal(1);
        expect(await factory.deployedContracts(0)).to.not.equal(0);

        // ############################ 2nd DroneDelivery
        // console.log("############################ 2nd DroneDelivery");
        // Magics happens
        salt = 2;
        bytecode = ethers.utils.arrayify(
            ethers.utils.hexConcat([
                droneDeliveryFactory.bytecode,
                droneDeliveryFactory.interface.encodeDeploy([
                    delivery.address,
                    deliveries[1].deliveryId,
                    conops.address,
                    accessControl.address,
                    starwingsMaster.address,
                ]),
            ])
        );

        // Create droneDelivery instance
        result = await factory.connect(pilot).deploy(bytecode, salt, {
            gasLimit: 9000000,
        });

        // Get event values
        temp = await result.wait();
        droneDeliveryAddr = temp.events?.filter((x) => {
            return x.event === "Deployed";
        })[0].args.addr;

        // console.log(`[DroneDelivery] deployed at ${droneDeliveryAddr}`);
        // console.log(`[DeliveryId] used ${deliveries[1].deliveryId}`);

        // Create contract object with deployed address
        droneDeliveryContract = new ethers.Contract(
            droneDeliveryAddr,
            droneDeliveryFactory.interface,
            pilot
        );

        // console.log(
        //     `[Verifiy] DeliveryId in DroneDelivery = ${await droneDeliveryContract.getDeliveryId()}`
        // );

        // Init flightdata for drone delivery
        droneFlightDataSample.pilot.pilotAddress = pilot.address;
        droneFlightDataSample.drone.droneAddress = drone.address;
        await droneDeliveryContract
            .connect(pilot)
            .initDelivery(droneFlightDataSample);

        const addressesFromFactory = await factory.getDeployedContracts();
        // console.log(`Deployed contracts = ${addressesFromFactory.length}`);

        expect((await factory.getDeployedContracts()).length).to.equal(2);
        expect(addressesFromFactory[0]).to.not.equal(0);
        expect(addressesFromFactory[1]).to.not.equal(0);
        expect(addressesFromFactory[0]).to.not.equal(addressesFromFactory[1]);

        // Global checks
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
    });
});
