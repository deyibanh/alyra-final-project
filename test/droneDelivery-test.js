const { expect } = require("chai");
const { ethers } = require("hardhat");

let droneDelivery, deliveryManager, conops, accessControl, starwingsMaster, factory, owner, pilot, drone;

const pilotSample = {
    _pilotAddress: "",
    _pilotName: "John Pilot",
};

const droneSample = {
    _droneAddress: "",
    _droneId: "78re2578",
    _droneType: "aiir32",
};

const deliverySample = {
    deliveryId: "DELIVERYID",
    supplierOrderId: "A47G-78",
    state: 0,
    from: "From1",
    fromAddr: 0x01,
    to: "To1",
    toAddr: 0x00,
    fromHubId: "007",
    toHubId: "0056",
};

const deploy = async () => {
    [owner, pilot, drone] = await ethers.getSigners();

    deliverySample.fromAddr = pilot.address;
    deliverySample.toAddr = drone.address;

    const droneFlightDataSample = {
        pilot: {
            index: 0,
            isDeleted: false,
            name: "John Pilot",
            pilotAddress: pilot.address,
            flightAddresses: [],
        },
        drone: {
            index: 0,
            isDeleted: false,
            droneId: "78re2578",
            droneType: "aiir32",
            droneAddress: drone.address,
            flightAddresses: [],
        },
        conopsId: 0,
        flightDatetime: 57875,
        flightDuration: 10,
        depart: "Terre",
        destination: "Moon",
    };

    // DEPLOY ACCESSCONTROL
    const AccessControl = await ethers.getContractFactory("SWAccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.deployed();

    const roleAdmin = await accessControl.ADMIN_ROLE();
    const rolePilot = await accessControl.PILOT_ROLE();
    const roleDrone = await accessControl.DRONE_ROLE();
    await accessControl.grantRole(roleAdmin, owner.address);
    await accessControl.grantRole(rolePilot, pilot.address);
    await accessControl.grantRole(roleDrone, drone.address);

    // DEPLOY CONOPSMANAGER
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

    // DEPLOY DELIVERYMANAGER
    const DeliveryManager = await ethers.getContractFactory("DeliveryManager");
    deliveryManager = await DeliveryManager.deploy(accessControl.address);
    await deliveryManager.deployed();

    await deliveryManager.newDelivery(deliverySample);

    // STARWINGS MASTER
    const StarwingsMaster = await ethers.getContractFactory("StarwingsMaster");
    starwingsMaster = await StarwingsMaster.deploy(accessControl.address, conops.address, deliveryManager.address);
    await starwingsMaster.deployed();

    // ADD PILOTE AND DRONE
    droneSample._droneAddress = drone.address;

    await starwingsMaster.addDrone(droneSample._droneAddress, droneSample._droneId, droneSample._droneType);
    pilotSample._pilotAddress = pilot.address;

    await starwingsMaster.addPilot(pilotSample._pilotAddress, pilotSample._pilotName);

    // DEPLOY DRONEDELIVERY
    const droneDeliveryFactory = await ethers.getContractFactory("DroneDelivery");

    // DroneFlightFactory
    const Factory = await ethers.getContractFactory("DroneFlightFactory");
    factory = await Factory.deploy(accessControl.address, starwingsMaster.address);
    await factory.deployed();

    // Magics happens
    const salt = 1;
    const bytecode = ethers.utils.arrayify(
        ethers.utils.hexConcat([
            droneDeliveryFactory.bytecode,
            droneDeliveryFactory.interface.encodeDeploy([
                deliveryManager.address,
                "DELIVERYID",
                conops.address,
                accessControl.address,
                starwingsMaster.address,
            ]),
        ])
    );

    // Create droneDelivery instance
    const result = await factory.connect(pilot).deploy(bytecode, salt, {
        gasLimit: 9000000,
    });

    // Get event values
    const temp = await result.wait();
    const droneDeliveryAddr = temp.events?.filter((x) => {
        return x.event === "Deployed";
    })[0].args.addr;

    // Create contract object with deployed address
    droneDelivery = new ethers.Contract(droneDeliveryAddr, droneDeliveryFactory.interface, pilot);

    // Init flightdata for drone delivery
    await droneDelivery.connect(pilot).initDelivery(droneFlightDataSample);

    return [deliveryManager, droneDelivery, conops, accessControl];
};

describe("DroneFlight", function () {
    beforeEach(async () => {
        await deploy();
    });

    describe("Info", function () {
        it("should get the delivery id", async () => {
            expect(await droneDelivery.getDeliveryId()).to.equal("DELIVERYID");
        });

        it("should get the flightInfoDisplay", async () => {
            const droneFlightDataExpected = [
                [ethers.constants.Zero, false, "John Pilot", pilot.address, []],
                [ethers.constants.Zero, false, "78re2578", "aiir32", drone.address, []],
                ethers.constants.Zero,
                ethers.BigNumber.from(57875),
                ethers.BigNumber.from(10),
                "Terre",
                "Moon",
            ];
            const expected = [
                "DELIVERYID",
                false,
                false,
                false,
                droneFlightDataExpected,
                0,
                0,
                [],
                [
                    [false, "CHU A", 0],
                    [false, "BASE B", 2],
                ],
            ];
            const result = await droneDelivery.flightInfoDisplay();
            expect(result).to.eql(expected);

            // expect().to.equal("DELIVERYID");
        });
    });

    describe("Checks", function () {
        it("should revert with Acces Refused message", async () => {
            await expect(droneDelivery.connect(owner).preFlightChecks(0)).to.be.revertedWith("Access Refused");

            await expect(droneDelivery.connect(owner).postFlightChecks(0)).to.be.revertedWith("Access Refused");
        });

        it("should set preflight check_id 0 to true", async () => {
            expect(await droneDelivery.getPreFlightChecks(0)).to.equal(false);

            await droneDelivery.connect(pilot).preFlightChecks(0);
            expect(await droneDelivery.getPreFlightChecks(0)).to.equal(true);
        });

        it("should set postfligfht check_id 1 to true", async () => {
            expect(await droneDelivery.getPostFlightChecks(1)).to.equal(false);

            await droneDelivery.connect(pilot).postFlightChecks(1);
            expect(await droneDelivery.getPostFlightChecks(1)).to.equal(true);
        });
    });

    describe("AirRisk Validation", function () {
        it("should validate and cancel an air Risk with id 1", async () => {
            await droneDelivery.connect(pilot).validateAirRisk(1);
            let airRisks = await droneDelivery.viewAirRisks();
            expect(airRisks[1].validated).to.equal(true);

            await droneDelivery.connect(pilot).cancelAirRisk(1);
            airRisks = await droneDelivery.viewAirRisks();
            expect(airRisks[1].validated).to.equal(false);
        });
    });

    describe("Events", function () {
        const riskEvent = {
            dateTime: 547856,
            risk: 0,
        };

        it("should add an Engine risk event with timestamp 547856", async () => {
            await droneDelivery.connect(drone).newRiskEvent(riskEvent);

            expect((await droneDelivery.viewRiskEvent(0)).dateTime).to.be.equal(547856);

            expect((await droneDelivery.viewRiskEvent(0)).risk).to.be.equal(0);
        });
    });

    describe("Checkpoints", function () {
        it("should add a checkpoint with latitude 25 and longitude 50", async () => {
            let checkPointsResult = await droneDelivery.connect(drone).getCheckpoints();
            expect(checkPointsResult.length).to.be.equal(0);
            const expectedTimestamp = new Date().getTime();

            await droneDelivery.connect(drone).addCheckpoint(expectedTimestamp, {
                latitude: 25,
                longitude: 50,
            });

            checkPointsResult = await droneDelivery.connect(drone).getCheckpoints();

            expect(checkPointsResult.length).to.be.equal(1);

            expect(checkPointsResult[0].time).to.be.equal(expectedTimestamp);
            expect(checkPointsResult[0].coordo.latitude).to.be.equal(25);
            expect(checkPointsResult[0].coordo.longitude).to.be.equal(50);
        });
    });

    describe("Parcel Management", function () {
        it("should revert as sender is not Drone", async () => {
            expect(await droneDelivery.isParcelPickedUp()).to.be.equal(false);

            await expect(droneDelivery.connect(owner).pickUp()).to.be.revertedWith("Access Refused");
        });
        it("should be picked up parcel", async () => {
            expect(await droneDelivery.isParcelPickedUp()).to.equal(false);
            await droneDelivery.connect(drone).pickUp();
            expect(await droneDelivery.isParcelPickedUp()).to.equal(true);
        });

        it("should revert as parcel was already picked up", async () => {
            expect(await droneDelivery.isParcelPickedUp()).to.be.equal(false);
            await droneDelivery.connect(drone).pickUp();
            await expect(droneDelivery.connect(drone).pickUp()).to.be.revertedWith("parcel already pickedUp");
        });
        it("should revert as parcel was not pickedup before delivery", async () => {
            expect(await droneDelivery.isParcelPickedUp()).to.be.equal(false);
            await expect(droneDelivery.connect(drone).deliver()).to.be.revertedWith("parcel not picked up before");
        });
        it("should deliver the parcel", async () => {
            expect(await droneDelivery.isParcelPickedUp()).to.equal(false);
            expect(await droneDelivery.isParcelDelivered()).to.equal(false);
            await droneDelivery.connect(drone).pickUp();
            expect(await droneDelivery.isParcelPickedUp()).to.equal(true);
            await droneDelivery.connect(drone).deliver();
            expect(await droneDelivery.isParcelDelivered()).to.equal(true);
        });
    });

    describe("Flight Status", function () {
        it("should revert as sender is not Pilot or Drone", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);

            await expect(droneDelivery.connect(owner).changeFlightStatus(2)).to.be.revertedWith("Access refused");
        });

        it("should revert as status sent is 1", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);

            await expect(droneDelivery.connect(pilot).changeFlightStatus(1)).to.be.revertedWith(
                "Cannot cancel flight this way"
            );
        });

        it("should revert due to flight not allowed", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);

            await expect(droneDelivery.connect(pilot).changeFlightStatus(2)).to.be.revertedWith(
                "Flying is not allowed"
            );
        });

        it("should revert as status 6 is outside range", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);

            await expect(droneDelivery.connect(pilot).changeFlightStatus(6)).to.be.revertedWith(
                "Not a valide logical status"
            );
        });

        it("should cancel a flight", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);
            await droneDelivery.connect(pilot).cancelFlight();
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(1);
        });

        context("with flight allowed", function () {
            beforeEach(async function () {
                await droneDelivery.connect(pilot).validateAirRisk(0);
                await droneDelivery.connect(pilot).validateAirRisk(1);
                await droneDelivery.connect(drone).pickUp();
                await droneDelivery.connect(pilot).preFlightChecks(0);
                await droneDelivery.connect(pilot).preFlightChecks(1);
                await droneDelivery.connect(pilot).preFlightChecks(2);
            });

            it("should change piloteflightstatus to 2", async () => {
                expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);
                await droneDelivery.connect(pilot).changeFlightStatus(2);
                expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(2);
            });

            it("should change droneflightstatus to 2", async () => {
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(0);
                await droneDelivery.connect(drone).changeFlightStatus(2);
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(2);
            });

            it("should revert due to flight not started (as pilot)", async () => {
                expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);
                await expect(droneDelivery.connect(pilot).changeFlightStatus(3)).to.be.revertedWith(
                    "status not allowed"
                );
            });

            it("should revert due to flight not started (as drone)", async () => {
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(0);
                await expect(droneDelivery.connect(drone).changeFlightStatus(3)).to.be.revertedWith(
                    "status not allowed"
                );
            });

            it("should pause a flight from pilot", async () => {
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(0);
                await droneDelivery.connect(drone).changeFlightStatus(2);
                await droneDelivery.connect(drone).changeFlightStatus(3);
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(3);
            });

            it("should pause a flight from drone", async () => {
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(0);
                await droneDelivery.connect(drone).changeFlightStatus(2);
                await droneDelivery.connect(drone).changeFlightStatus(3);
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(3);
            });
        });
    });
});
