const { expect } = require("chai");
const { ethers } = require("hardhat");

let droneDelivery, deliveryManager, conops, accessControl, owner, pilot, drone;

const deploy = async () => {
    [owner, pilot, drone] = await ethers.getSigners();

    const droneFlightDataSample = {
        conopsId: 0,
        droneAddr: drone.address,
        piloteAddr: pilot.address,
        flightDatetime: 57875,
        flightDuration: 10,
        pilotName: "john",
        droneType: "azer",
        droneId: 4,
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

    // DEPLOY DRONEDELIVERY
    const DroneDelivery = await ethers.getContractFactory("DroneDelivery");

    droneDelivery = await DroneDelivery.deploy(
        deliveryManager.address,
        0,
        conops.address,
        accessControl.address,
        droneFlightDataSample
    );

    await droneDelivery.deployed();

    return [deliveryManager, droneDelivery, conops, accessControl];
};

describe("droneflight", function () {
    beforeEach(async () => {
        await deploy();
    });

    describe("Checks", function () {
        it("Should revert with Acces Refused message", async () => {
            await expect(droneDelivery.preFlightChecks(0)).to.be.revertedWith(
                "Access refused"
            );

            await expect(droneDelivery.postFlightChecks(0)).to.be.revertedWith(
                "Access refused"
            );
        });

        it("Should set preflight check_id 0 to true", async () => {
            expect(await droneDelivery.getPreFlightChecks(0)).to.equal(false);

            await droneDelivery.connect(pilot).preFlightChecks(0);
            expect(await droneDelivery.getPreFlightChecks(0)).to.equal(true);
        });

        it("Should set postfligfht check_id 1 to true", async () => {
            expect(await droneDelivery.getPostFlightChecks(0)).to.equal(false);

            await droneDelivery.connect(pilot).postFlightChecks(0);
            expect(await droneDelivery.getPostFlightChecks(0)).to.equal(true);
        });
    });

    describe("AirRisk validation", function () {
        it("Should validate and cancel an air Risk with id 1 ", async () => {
            await droneDelivery.connect(pilot).validateAirRisk(1);
            let airRisks = await droneDelivery.viewAirRisks();
            expect(airRisks[1].validated).to.equal(true);

            await droneDelivery.connect(pilot).cancelAirRisk(1);
            airRisks = await droneDelivery.viewAirRisks();
            expect(airRisks[1].validated).to.equal(false);
        });
    });

    describe("events", function () {
        const riskEvent = {
            dateTime: 547856,
            risk: 0,
        };

        it("Should add an Engine risk event with timestamp 547856", async () => {
            await droneDelivery.connect(drone).newRiskEvent(riskEvent);

            expect((await droneDelivery.viewRiskEvent(0)).dateTime).to.be.equal(
                547856
            );

            expect((await droneDelivery.viewRiskEvent(0)).risk).to.be.equal(0);
        });
    });

    describe("flight status", function () {
        it("Should revert due as sender is not Pilot or Drone", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);

            await expect(
                droneDelivery.changeFlightStatus(2)
            ).to.be.revertedWith("Access refused");
        });

        it("Should revert as status sent is 1", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);

            await expect(
                droneDelivery.connect(pilot).changeFlightStatus(1)
            ).to.be.revertedWith("Cannot cancel flight this way");
        });

        it("Should revert due to flight not allowed", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);

            await expect(
                droneDelivery.connect(pilot).changeFlightStatus(2)
            ).to.be.revertedWith("Flying is not allowed");
        });

        it("Should revert as status 6 is outside range", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);

            await expect(
                droneDelivery.connect(pilot).changeFlightStatus(6)
            ).to.be.revertedWith("Not a valide logical status");
        });

        it("Should cancel a flight", async () => {
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(0);
            await droneDelivery.connect(pilot).cancelFlight();
            expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(1);
        });

        context("with flight allowed", function () {
            beforeEach(async function () {
                await droneDelivery.connect(pilot).validateAirRisk(0);
                await droneDelivery.connect(pilot).validateAirRisk(1);
            });

            it("Should change piloteflightstatus to 2", async () => {
                expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(
                    0
                );
                await droneDelivery.connect(pilot).changeFlightStatus(2);
                expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(
                    2
                );
            });

            it("Should change droneflightstatus to 2", async () => {
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(
                    0
                );
                await droneDelivery.connect(drone).changeFlightStatus(2);
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(
                    2
                );
            });

            it("Should revert due to flight not started", async () => {
                expect(await droneDelivery.viewPilotFlightstatus()).to.be.equal(
                    0
                );
                await expect(
                    droneDelivery.connect(pilot).changeFlightStatus(3)
                ).to.be.revertedWith("status not allowed");
            });

            it("Should revert due to flight not started", async () => {
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(
                    0
                );
                await expect(
                    droneDelivery.connect(drone).changeFlightStatus(3)
                ).to.be.revertedWith("status not allowed");
            });

            it("Should pause a flight from pilot", async () => {
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(
                    0
                );
                await droneDelivery.connect(drone).changeFlightStatus(2);
                await droneDelivery.connect(drone).changeFlightStatus(3);
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(
                    3
                );
            });

            it("Should pause a flight from drone", async () => {
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(
                    0
                );
                await droneDelivery.connect(drone).changeFlightStatus(2);
                await droneDelivery.connect(drone).changeFlightStatus(3);
                expect(await droneDelivery.viewDroneFlightstatus()).to.be.equal(
                    3
                );
            });
        });
    });
});
