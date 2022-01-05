const { expect } = require("chai");
const { ethers } = require("hardhat");

let droneFlight, conops, accessControl, owner, pilot, drone;

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
    const DroneFlight = await ethers.getContractFactory("DroneFlight");

    droneFlight = await DroneFlight.deploy(
        conops.address,
        accessControl.address,
        droneFlightDataSample
    );

    await droneFlight.deployed();

    return [droneFlight, conops, accessControl];
};

describe("droneflight", function () {
    beforeEach(async () => {
        await deploy();
    });

    describe("Checks", function () {
        it("Should revert with Acces Refused message", async () => {
            await expect(droneFlight.checkEngine()).to.be.revertedWith(
                "Access refused"
            );

            await expect(droneFlight.checkBattery()).to.be.revertedWith(
                "Access refused"
            );

            await expect(droneFlight.checkControlStation()).to.be.revertedWith(
                "Access refused"
            );
        });

        it("Should set engineCheck to true", async () => {
            expect(await droneFlight.getEngineCheck()).to.equal(false);
            const result = await droneFlight
                .connect(pilot)
                .callStatic.checkEngine();
            expect(result).to.equal(true);

            await droneFlight.connect(pilot).checkEngine();
            expect(await droneFlight.getEngineCheck()).to.equal(true);
        });

        it("Should set batteryCheck to true", async () => {
            expect(await droneFlight.getBatteryCheck()).to.equal(false);
            const result = await droneFlight
                .connect(pilot)
                .callStatic.checkBattery();
            expect(result).to.equal(true);

            await droneFlight.connect(pilot).checkBattery();
            expect(await droneFlight.getBatteryCheck()).to.equal(true);
        });

        it("Should set batteryCheck to true", async () => {
            expect(await droneFlight.getBatteryCheck()).to.equal(false);
            const result = await droneFlight
                .connect(pilot)
                .callStatic.checkBattery();
            expect(result).to.equal(true);

            await droneFlight.connect(pilot).checkBattery();
            expect(await droneFlight.getBatteryCheck()).to.equal(true);
        });

        it("Should set controlStationCheck to true", async () => {
            expect(await droneFlight.getControlStationCheck()).to.equal(false);
            const result = await droneFlight
                .connect(pilot)
                .callStatic.checkControlStation();
            expect(result).to.equal(true);

            await droneFlight.connect(pilot).checkControlStation();
            expect(await droneFlight.getControlStationCheck()).to.equal(true);
        });
        it("Should set engineCheck to true", async () => {
            expect(await droneFlight.getEngineCheck()).to.equal(false);
            const result = await droneFlight
                .connect(pilot)
                .callStatic.checkEngine();
            expect(result).to.equal(true);

            await droneFlight.connect(pilot).checkEngine();
            expect(await droneFlight.getEngineCheck()).to.equal(true);
        });
    });

    describe("AirRisk validation", function () {
        it("Should validate and cancel an air Risk with id 1 ", async () => {
            await droneFlight.connect(pilot).validateAirRisk(1);
            let airRisks = await droneFlight.viewAirRisks();
            expect(airRisks[1].validated).to.equal(true);

            await droneFlight.connect(pilot).cancelAirRisk(1);
            airRisks = await droneFlight.viewAirRisks();
            expect(airRisks[1].validated).to.equal(false);
        });
    });

    describe("events", function () {
        const riskEvent = {
            dateTime: 547856,
            risk: 0,
        };

        it("Should add an Engine risk event with timestamp 547856", async () => {
            await droneFlight.connect(drone).newRiskEvent(riskEvent);

            expect((await droneFlight.viewRiskEvent(0)).dateTime).to.be.equal(
                547856
            );

            expect((await droneFlight.viewRiskEvent(0)).risk).to.be.equal(0);
        });
    });

    describe("flight status", function () {
        it("Should revert a flight due to flight not allowed", async () => {
            expect(await droneFlight.viewFlightstatus()).to.be.equal(0);

            await expect(
                droneFlight.connect(drone).changeFlightStatus(2)
            ).to.be.revertedWith("Flying is not allowed");
        });

        it("Should cancel a flight", async () => {
            expect(await droneFlight.viewFlightstatus()).to.be.equal(0);
            await droneFlight.connect(pilot).cancelFlight();
            expect(await droneFlight.viewFlightstatus()).to.be.equal(1);
        });

        context("with flight allowed", function () {
            beforeEach(async function () {
                await droneFlight.connect(pilot).validateAirRisk(0);
                await droneFlight.connect(pilot).validateAirRisk(1);
            });

            it("Should start a flight", async () => {
                expect(await droneFlight.viewFlightstatus()).to.be.equal(0);
                await droneFlight.connect(drone).changeFlightStatus(2);
                expect(await droneFlight.viewFlightstatus()).to.be.equal(2);
            });

            it("Should revert due to flight not started", async () => {
                expect(await droneFlight.viewFlightstatus()).to.be.equal(0);
                await expect(
                    droneFlight.connect(drone).changeFlightStatus(3)
                ).to.be.revertedWith("status not allowed");
            });

            it("Should pause a flight", async () => {
                expect(await droneFlight.viewFlightstatus()).to.be.equal(0);
                await droneFlight.connect(drone).changeFlightStatus(2);
                await droneFlight.connect(drone).changeFlightStatus(3);
                expect(await droneFlight.viewFlightstatus()).to.be.equal(3);
            });
        });
    });
});
