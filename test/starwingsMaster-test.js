const { expect } = require("chai");
const { ethers } = require("hardhat");

let SWAccessControl;
let ConopsManager;
let DeliveryManager;
let StarwingsMaster;
let DroneFlightFactory;
// eslint-disable-next-line no-unused-vars
let owner;
let notAdmin;
let pilot;
let pilot2;
let drone;
let drone2;

async function deploy() {
    [owner, notAdmin, pilot, pilot2, drone, drone2] = await ethers.getSigners();

    const SWAccessControlArtifact = await ethers.getContractFactory(
        "SWAccessControl"
    );
    const ConopsManagerArtifact = await ethers.getContractFactory(
        "ConopsManager"
    );
    const DeliveryManagerArtifact = await ethers.getContractFactory(
        "DeliveryManager"
    );
    const StarwingsMasterArtifact = await ethers.getContractFactory(
        "StarwingsMaster"
    );
    const DroneFlightFactoryArtifact = await ethers.getContractFactory(
        "DroneFlightFactory"
    );

    SWAccessControl = await SWAccessControlArtifact.deploy();
    await SWAccessControl.deployed();
    ConopsManager = await ConopsManagerArtifact.deploy(SWAccessControl.address);
    DeliveryManager = await DeliveryManagerArtifact.deploy(
        SWAccessControl.address
    );
    await ConopsManager.deployed();
    await DeliveryManager.deployed();
    StarwingsMaster = await StarwingsMasterArtifact.deploy(
        SWAccessControl.address,
        ConopsManager.address,
        DeliveryManager.address
    );
    await StarwingsMaster.deployed();
    DroneFlightFactory = await DroneFlightFactoryArtifact.deploy(
        SWAccessControl.address,
        StarwingsMaster.address
    );
    await DroneFlightFactory.deployed();
}

describe("StarwingsMaster", function () {
    beforeEach(async () => {
        await deploy();
    });

    context("Get DroneFlight", function () {
        it("should not get the DroneFlightFactory address if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getDroneFlightFactoryAddress()
            ).to.be.revertedWith("Access refused");
        });

        it("should set the DroneFlightFactory address.", async function () {
            let expectResult = ethers.constants.AddressZero;
            let result = await StarwingsMaster.getDroneFlightFactoryAddress();
            expect(result).to.equal(expectResult);

            expectResult = DroneFlightFactory.address;
            await StarwingsMaster.setDroneFlightFactoryAddress(expectResult);
            result = await StarwingsMaster.getDroneFlightFactoryAddress();
            expect(result).to.equal(expectResult);
        });

        it("should not set the DroneFlightFactory address if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).setDroneFlightFactoryAddress(
                    DroneFlightFactory.address
                )
            ).to.be.revertedWith("Access refused");
        });

        it("should get the list of DroneFlight address.", async function () {
            const expectResult = [];
            const result = await StarwingsMaster.getDroneFlightAddressList();
            expect(result).to.eql(expectResult);
        });

        it("should not get the list of DroneFlight address if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getDroneFlightAddressList()
            ).to.be.revertedWith("Access refused");
        });

        it("should not get the DroneFlight address if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getDroneFlightAddress(0)
            ).to.be.revertedWith("Access refused");
        });
    });

    // @todo: Tests not pass `require(msg.sender == droneFlightFactoryAddress, "not allowed");` in addDroneFlight method.
    // context("Add DroneFlight", function () {
    //     let DroneDelivery;

    //     beforeEach(async () => {
    //         const DroneDeliveryArtifact = await ethers.getContractFactory(
    //             "DroneDelivery"
    //         );
    //         const flightData = {
    //             piloteAddr: pilot.address,
    //             droneAddr: drone.address,
    //             conopsId: 0,
    //             flightDatetime: 57875,
    //             flightDuration: 10,
    //             pilotName: "john",
    //             droneType: "azer",
    //             droneId: "45",
    //             depart: "Terre",
    //             destination: "Moon",
    //         };
    //         await ConopsManager.addConops(
    //             "test1",
    //             "with 4 plots",
    //             "with 5 plots",
    //             "with flag",
    //             "with 1 person",
    //             [
    //                 { name: "CHU A", riskType: 0 },
    //                 { name: "BASE B", riskType: 2 },
    //             ],
    //             4,
    //             5
    //         );
    //         DroneDelivery = await DroneDeliveryArtifact.deploy(
    //             DeliveryManager.address,
    //             44,
    //             ConopsManager.address,
    //             SWAccessControl.address,
    //             flightData
    //         );
    //         await DroneDelivery.deployed();
    //     });

    //     it("should add a DroneFlight.", async function () {
    //         await expect(
    //             StarwingsMaster.addPilot(pilot.address, "Pilot Name")
    //         ).to.emit(StarwingsMaster, "PilotAdded");
    //         await expect(
    //             StarwingsMaster.addDrone(
    //                 drone.address,
    //                 "Drone ID",
    //                 "Drone Type"
    //             )
    //         ).to.emit(StarwingsMaster, "DroneAdded");
    //         await StarwingsMaster.setDroneFlightFactoryAddress(
    //             DroneFlightFactory.address
    //         );

    //         let expectResult = [];
    //         let result = await StarwingsMaster.getDroneFlightAddressList();
    //         expect(result).to.eql(expectResult);

    //         expectResult = [];
    //         result = await StarwingsMaster.getPilot(pilot.address);
    //         expect(result.flightAddresses).to.eql(expectResult);

    //         expectResult = [];
    //         result = await StarwingsMaster.getDrone(drone.address);
    //         expect(result.flightAddresses).to.eql(expectResult);

    //         await StarwingsMaster.addDroneFlight(
    //             DroneDelivery.address,
    //             pilot.address,
    //             drone.address
    //         );

    //         expectResult = [DroneDelivery.address];
    //         result = await StarwingsMaster.getDroneFlightAddressList();
    //         expect(result).to.eql(expectResult);

    //         result = await StarwingsMaster.getPilot(pilot.address);
    //         expect(result.flightAddresses).to.eql(expectResult);

    //         result = await StarwingsMaster.getDrone(drone.address);
    //         expect(result.flightAddresses).to.eql(expectResult);
    //     });

    //     it("should not add a DroneFlight if Pilot index out of the list size.", async function () {
    //         await expect(
    //             StarwingsMaster.addDroneFlight(
    //                 DroneDelivery.address,
    //                 pilot.address,
    //                 drone.address
    //             )
    //         ).to.be.revertedWith("Out of size index.");
    //     });

    //     it("should not add a DroneFlight if Pilot not exist.", async function () {
    //         await StarwingsMaster.addPilot(pilot.address, "Pilot Name");
    //         await expect(
    //             StarwingsMaster.addDroneFlight(
    //                 DroneDelivery.address,
    //                 pilot2.address,
    //                 drone.address
    //             )
    //         ).to.be.revertedWith("Pilot not found.");
    //     });

    //     it("should not add a DroneFlight if Drone index out of the list size.", async function () {
    //         await StarwingsMaster.addPilot(pilot.address, "Pilot Name");
    //         await expect(
    //             StarwingsMaster.addDroneFlight(
    //                 DroneDelivery.address,
    //                 pilot.address,
    //                 drone.address
    //             )
    //         ).to.be.revertedWith("Out of size index.");
    //     });

    //     it("should not add a DroneFlight if Drone not exist.", async function () {
    //         await StarwingsMaster.addPilot(pilot.address, "Pilot Name");
    //         await StarwingsMaster.addDrone(
    //             drone.address,
    //             "Drone ID",
    //             "Drone Type"
    //         );
    //         await expect(
    //             StarwingsMaster.addDroneFlight(
    //                 DroneDelivery.address,
    //                 pilot.address,
    //                 drone2.address
    //             )
    //         ).to.be.revertedWith("Drone not found.");
    //     });
    // });

    context("Pilot", function () {
        it("should not get the list of Pilot if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getPilotList()
            ).to.be.revertedWith("Access refused");
        });

        it("should not get the Pilot if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getPilot(
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Access refused");
        });

        it("should not get the Pilot if Pilot index out of the list size.", async function () {
            await expect(
                StarwingsMaster.getPilot(ethers.constants.AddressZero)
            ).to.be.revertedWith("Out of size index.");
        });

        it("should not get the Pilot if Pilot not exist.", async function () {
            await StarwingsMaster.addPilot(pilot.address, "Pilot Name");
            await expect(
                StarwingsMaster.getPilot(ethers.constants.AddressZero)
            ).to.be.revertedWith("Pilot not found.");
        });

        it("should add a Pilot if it is a new address.", async function () {
            const expectResult = [];
            let result = await StarwingsMaster.getPilotList();
            expect(result).to.eql(expectResult);

            await expect(
                StarwingsMaster.addPilot(pilot.address, "Pilot Name")
            ).to.emit(StarwingsMaster, "PilotAdded");

            result = await StarwingsMaster.getPilotList();
            expect(result.length).to.equal(1);
            expect(result[0].index).to.equal(0);
            expect(result[0].isDeleted).to.equal(false);
            expect(result[0].name).to.equal("Pilot Name");
            expect(result[0].pilotAddress).to.equal(pilot.address);
            expect(result[0].flightAddresses).to.eql([]);

            result = await StarwingsMaster.getPilotIndex(pilot.address);
            expect(result.toNumber()).to.equal(0);

            await expect(
                StarwingsMaster.addPilot(pilot2.address, "Pilot2 Name")
            ).to.emit(StarwingsMaster, "PilotAdded");

            result = await StarwingsMaster.getPilotList();
            expect(result.length).to.equal(2);
            expect(result[1].index).to.equal(1);
            expect(result[1].isDeleted).to.equal(false);
            expect(result[1].name).to.equal("Pilot2 Name");
            expect(result[1].pilotAddress).to.equal(pilot2.address);
            expect(result[1].flightAddresses).to.eql([]);

            result = await StarwingsMaster.getPilotIndex(pilot2.address);
            expect(result.toNumber()).to.equal(1);
        });

        it("should add a Pilot if the pilot has been deleted.", async function () {
            const expectResult = [];
            let result = await StarwingsMaster.getPilotList();
            expect(result).to.eql(expectResult);

            await expect(
                StarwingsMaster.addPilot(pilot.address, "Pilot Name")
            ).to.emit(StarwingsMaster, "PilotAdded");

            result = await StarwingsMaster.getPilotList();
            expect(result.length).to.equal(1);
            expect(result[0].index).to.equal(0);
            expect(result[0].isDeleted).to.equal(false);
            expect(result[0].name).to.equal("Pilot Name");
            expect(result[0].pilotAddress).to.equal(pilot.address);
            expect(result[0].flightAddresses).to.eql([]);

            await StarwingsMaster.deletePilot(pilot.address);

            await expect(
                StarwingsMaster.addPilot(pilot.address, "New Pilot Name")
            ).to.emit(StarwingsMaster, "PilotAdded");

            result = await StarwingsMaster.getPilotList();
            expect(result.length).to.equal(1);
            expect(result[0].index).to.equal(0);
            expect(result[0].isDeleted).to.equal(false);
            expect(result[0].name).to.equal("New Pilot Name");
            expect(result[0].pilotAddress).to.equal(pilot.address);
            expect(result[0].flightAddresses).to.eql([]);
        });

        it("should not add a Pilot if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).addPilot(
                    pilot.address,
                    "Pilot Name"
                )
            ).to.be.revertedWith("Access refused");
        });

        it("should not add a Pilot if it is not a new address and it has not been deleted.", async function () {
            await StarwingsMaster.addPilot(pilot.address, "Pilot Name");
            await expect(
                StarwingsMaster.addPilot(pilot.address, "Pilot Name")
            ).to.be.revertedWith("Pilot already added.");
        });

        it("should delete a Pilot.", async function () {
            await StarwingsMaster.addPilot(pilot.address, "Pilot Name");
            await StarwingsMaster.addPilot(pilot2.address, "Pilot2 Name");

            let result = await StarwingsMaster.getPilotList();
            expect(result.length).to.equal(2);
            expect(result[0].isDeleted).to.equal(false);
            expect(result[0].pilotAddress).to.equal(pilot.address);
            expect(result[1].isDeleted).to.equal(false);
            expect(result[1].pilotAddress).to.equal(pilot2.address);

            await expect(StarwingsMaster.deletePilot(pilot.address)).to.emit(
                StarwingsMaster,
                "PilotDeleted"
            );

            result = await StarwingsMaster.getPilotList();
            expect(result.length).to.equal(2);
            expect(result[0].isDeleted).to.equal(true);
            expect(result[0].pilotAddress).to.equal(pilot.address);
            expect(result[1].isDeleted).to.equal(false);
            expect(result[1].pilotAddress).to.equal(pilot2.address);

            await expect(StarwingsMaster.deletePilot(pilot2.address)).to.emit(
                StarwingsMaster,
                "PilotDeleted"
            );
            result = await StarwingsMaster.getPilotList();
            expect(result.length).to.equal(2);
            expect(result[0].isDeleted).to.equal(true);
            expect(result[0].pilotAddress).to.equal(pilot.address);
            expect(result[1].isDeleted).to.equal(true);
            expect(result[1].pilotAddress).to.equal(pilot2.address);
        });

        it("should not delete a Pilot if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).deletePilot(pilot.address)
            ).to.be.revertedWith("Access refused");
        });

        it("should not delete the Pilot if Pilot not exist.", async function () {
            await StarwingsMaster.addPilot(pilot.address, "Pilot Name");
            await expect(
                StarwingsMaster.getPilot(ethers.constants.AddressZero)
            ).to.be.revertedWith("Pilot not found.");
        });

        it("should not delete the Pilot if Pilot index out of the list size.", async function () {
            await expect(
                StarwingsMaster.deletePilot(ethers.constants.AddressZero)
            ).to.be.revertedWith("Out of size index.");
        });

        it("should not get the Pilot index if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getPilotIndex(pilot.address)
            ).to.be.revertedWith("Access refused");
        });
    });

    context("Drone", function () {
        it("should not get the list of Drone if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getDroneList()
            ).to.be.revertedWith("Access refused");
        });

        it("should not get the Drone if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getDrone(
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Access refused");
        });

        it("should not get the Drone if Drone index out of the list size.", async function () {
            await expect(
                StarwingsMaster.getDrone(ethers.constants.AddressZero)
            ).to.be.revertedWith("Out of size index.");
        });

        it("should not get the Drone if Drone not exist.", async function () {
            await StarwingsMaster.addDrone(
                pilot.address,
                "Drone ID",
                "Drone Type"
            );
            await expect(
                StarwingsMaster.getDrone(ethers.constants.AddressZero)
            ).to.be.revertedWith("Drone not found.");
        });

        it("should add a Drone if it is a new address.", async function () {
            const expectResult = [];
            let result = await StarwingsMaster.getDroneList();
            expect(result).to.eql(expectResult);

            await expect(
                StarwingsMaster.addDrone(
                    drone.address,
                    "Drone ID",
                    "Drone Type"
                )
            ).to.emit(StarwingsMaster, "DroneAdded");

            result = await StarwingsMaster.getDroneList();
            expect(result.length).to.equal(1);
            expect(result[0].index).to.equal(0);
            expect(result[0].isDeleted).to.equal(false);
            expect(result[0].droneId).to.equal("Drone ID");
            expect(result[0].droneType).to.equal("Drone Type");
            expect(result[0].droneAddress).to.equal(drone.address);
            expect(result[0].flightAddresses).to.eql([]);

            result = await StarwingsMaster.getDroneIndex(drone.address);
            expect(result.toNumber()).to.equal(0);

            await expect(
                StarwingsMaster.addDrone(
                    drone2.address,
                    "Drone2 ID",
                    "Drone2 Type"
                )
            ).to.emit(StarwingsMaster, "DroneAdded");

            result = await StarwingsMaster.getDroneList();
            expect(result.length).to.equal(2);
            expect(result[1].index).to.equal(1);
            expect(result[1].isDeleted).to.equal(false);
            expect(result[1].droneId).to.equal("Drone2 ID");
            expect(result[1].droneType).to.equal("Drone2 Type");
            expect(result[1].droneAddress).to.equal(drone2.address);
            expect(result[1].flightAddresses).to.eql([]);

            result = await StarwingsMaster.getDroneIndex(drone2.address);
            expect(result.toNumber()).to.equal(1);
        });

        it("should add a Drone if the Drone has been deleted.", async function () {
            const expectResult = [];
            let result = await StarwingsMaster.getDroneList();
            expect(result).to.eql(expectResult);

            await expect(
                StarwingsMaster.addDrone(
                    drone.address,
                    "Drone ID",
                    "Drone Type"
                )
            ).to.emit(StarwingsMaster, "DroneAdded");

            result = await StarwingsMaster.getDroneList();
            expect(result.length).to.equal(1);
            expect(result[0].index).to.equal(0);
            expect(result[0].isDeleted).to.equal(false);
            expect(result[0].droneId).to.equal("Drone ID");
            expect(result[0].droneType).to.equal("Drone Type");
            expect(result[0].droneAddress).to.equal(drone.address);
            expect(result[0].flightAddresses).to.eql([]);

            await StarwingsMaster.deleteDrone(drone.address);

            await expect(
                StarwingsMaster.addDrone(
                    drone.address,
                    "New Drone ID",
                    "New Drone Type"
                )
            ).to.emit(StarwingsMaster, "DroneAdded");

            result = await StarwingsMaster.getDroneList();
            expect(result.length).to.equal(1);
            expect(result[0].index).to.equal(0);
            expect(result[0].isDeleted).to.equal(false);
            expect(result[0].droneId).to.equal("New Drone ID");
            expect(result[0].droneType).to.equal("New Drone Type");
            expect(result[0].droneAddress).to.equal(drone.address);
            expect(result[0].flightAddresses).to.eql([]);
        });

        it("should not add a Drone if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).addDrone(
                    drone.address,
                    "Drone ID",
                    "Drone Type"
                )
            ).to.be.revertedWith("Access refused");
        });

        it("should not add a Drone if it is not a new address and it has not been deleted.", async function () {
            await StarwingsMaster.addDrone(
                drone.address,
                "Drone ID",
                "Drone Type"
            );
            await expect(
                StarwingsMaster.addDrone(
                    drone.address,
                    "Drone ID",
                    "Drone Type"
                )
            ).to.be.revertedWith("Drone already added.");
        });

        it("should delete a Drone.", async function () {
            await StarwingsMaster.addDrone(
                drone.address,
                "Drone ID",
                "Drone Type"
            );
            await StarwingsMaster.addDrone(
                drone2.address,
                "Drone2 ID",
                "Drone2 Type"
            );

            let result = await StarwingsMaster.getDroneList();
            expect(result.length).to.equal(2);
            expect(result[0].isDeleted).to.equal(false);
            expect(result[0].droneAddress).to.equal(drone.address);
            expect(result[1].isDeleted).to.equal(false);
            expect(result[1].droneAddress).to.equal(drone2.address);

            await expect(StarwingsMaster.deleteDrone(drone.address)).to.emit(
                StarwingsMaster,
                "DroneDeleted"
            );

            result = await StarwingsMaster.getDroneList();
            expect(result.length).to.equal(2);
            expect(result[0].isDeleted).to.equal(true);
            expect(result[0].droneAddress).to.equal(drone.address);
            expect(result[1].isDeleted).to.equal(false);
            expect(result[1].droneAddress).to.equal(drone2.address);

            await expect(StarwingsMaster.deleteDrone(drone2.address)).to.emit(
                StarwingsMaster,
                "DroneDeleted"
            );
            result = await StarwingsMaster.getDroneList();
            expect(result.length).to.equal(2);
            expect(result[0].isDeleted).to.equal(true);
            expect(result[0].droneAddress).to.equal(drone.address);
            expect(result[1].isDeleted).to.equal(true);
            expect(result[1].droneAddress).to.equal(drone2.address);
        });

        it("should not delete a Drone if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).deleteDrone(drone.address)
            ).to.be.revertedWith("Access refused");
        });

        it("should not delete a Drone if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).deleteDrone(drone.address)
            ).to.be.revertedWith("Access refused");
        });

        it("should not delete the Drone if Drone not exist.", async function () {
            await StarwingsMaster.addDrone(
                drone.address,
                "Drone ID",
                "Drone Type"
            );
            await expect(
                StarwingsMaster.getDrone(ethers.constants.AddressZero)
            ).to.be.revertedWith("Drone not found.");
        });

        it("should not get the Drone index if sender has not the admin role.", async function () {
            await expect(
                StarwingsMaster.connect(notAdmin).getDroneIndex(pilot.address)
            ).to.be.revertedWith("Access refused");
        });
    });

    context("Contracts", function () {
        it("should get the AccessControl address.", async function () {
            const expectResult = SWAccessControl.address;
            const result = await StarwingsMaster.getAccessControlAddress();
            expect(result).to.equal(expectResult);
        });

        it("should get the ConopsManager address.", async function () {
            const expectResult = ConopsManager.address;
            const result = await StarwingsMaster.getConopsManager();
            expect(result).to.equal(expectResult);
        });

        it("should get the DeliveryManager address.", async function () {
            const expectResult = DeliveryManager.address;
            const result = await StarwingsMaster.getDeliveryManager();
            expect(result).to.equal(expectResult);
        });
    });
});
