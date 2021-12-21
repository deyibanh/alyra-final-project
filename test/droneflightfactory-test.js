const { expect } = require("chai");
const { ethers } = require("hardhat");

let factory, accessControl, owner, pilot, drone ;

const deploy = async () => {
    [owner, pilot, drone] = await ethers.getSigners();

        const AccessControl = await ethers.getContractFactory(
            "SWAccessControl"
        );
        accessControl = await AccessControl.deploy();
        await accessControl.deployed();
        role_admin = await accessControl.ADMIN_ROLE();  
        role_pilot = await accessControl.PILOT_ROLE();
        role_drone = await accessControl.DRONE_ROLE();          
        await accessControl.grantRole(role_admin, owner.address);
        await accessControl.grantRole(role_pilot, pilot.address);
        await accessControl.grantRole(role_drone, drone.address);

        const Factory = await ethers.getContractFactory("DroneFlightFactory");
        factory = await Factory.deploy(accessControl.address);
        await factory.deployed();
    
    return [factory, accessControl]
}

describe("DroneFlightFactory", function () {

    beforeEach(async () => {
        await deploy()
    });
    
    it("Should revert due to caller not pilot", async () => {
        expect((await factory.getDeployedContracts()).length).to.equal(0);    
        await expect(factory.connect(owner).newDroneFlight(0)).to.be.revertedWith("you don't have the role");
    });

    it("Should deploy 2 new DroneDelivery contract", async () => {
        expect((await factory.getDeployedContracts()).length).to.equal(0);    
        const addDroneDeliveryTx = await factory.connect(pilot).newDroneFlight(0);

        await addDroneDeliveryTx.wait();

        expect((await factory.getDeployedContracts()).length).to.equal(1);  
        expect(await factory.deployedContracts(0)).to.not.equal(0);

        const addDroneDeliveryTx2 = await factory.connect(pilot).newDroneFlight(0);
        await addDroneDeliveryTx2.wait(); 
        
        expect((await factory.getDeployedContracts()).length).to.equal(2);  
        expect(await factory.deployedContracts(1)).to.not.equal(0);
        expect(await factory.deployedContracts(0)).to.not.equal(await factory.deployedContracts(1));

    });
});