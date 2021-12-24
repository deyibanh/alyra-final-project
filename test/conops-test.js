const { expect } = require("chai");
const { ethers } = require("hardhat");

let conops, accessControl, owner, addr1, roleAdmin;

const deploy = async () => {
    [owner, addr1] = await ethers.getSigners();

    const AccessControl = await ethers.getContractFactory("SWAccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.deployed();
    roleAdmin = await accessControl.ADMIN_ROLE();
    await accessControl.grantRole(roleAdmin, owner.address);

    const Conops = await ethers.getContractFactory("ConopsManager");
    conops = await Conops.deploy(accessControl.address);
    await conops.deployed();

    return [conops, accessControl];
};

describe("Conops", function () {
    beforeEach(async () => {
        await deploy();
    });

    it("Should return the added conops", async () => {
        expect((await conops.viewAllConops()).length).to.equal(0);

        const addConopsTx = await conops.addConops(
            "test1",
            "with 4 plots",
            "with 5 plots",
            "with flag",
            "with 1 person",
            ["CHU A", "BASE B"],
            [0, 2],
            4,
            5
        );

        await addConopsTx.wait();

        expect((await conops.viewAllConops()).length).to.equal(1);

        const returnedConops = await conops.viewConops(0);

        // eslint-disable-next-line no-unused-expressions
        expect(returnedConops.activated).to.be.true;
        expect(returnedConops.name).to.equal("test1");
        expect(returnedConops.startingPoint).to.equal("with 4 plots");
        expect(returnedConops.endPoint).to.equal("with 5 plots");
        expect(returnedConops.crossRoad).to.equal("with flag");
        expect(returnedConops.exclusionZone).to.equal("with 1 person");
        expect(returnedConops.grc).to.equal(4);
        expect(returnedConops.arc).to.equal(5);
        expect(returnedConops.airRiskList[0].name).to.equal("CHU A");
        expect(returnedConops.airRiskList[0].riskType).to.equal(0);
        expect(returnedConops.airRiskList[1].name).to.equal("BASE B");
        expect(returnedConops.airRiskList[1].riskType).to.equal(2);
    });

    it("should revert with proper message", async () => {
        await expect(
            conops
                .connect(addr1)
                .addConops(
                    "test1",
                    "with 4 plots",
                    "with 5 plots",
                    "with flag",
                    "with 1 person",
                    ["CHU A", "BASE B"],
                    [0, 2],
                    4,
                    5
                )
        ).to.be.revertedWith("you don't have the role");
    });
});

describe("Conops activation", () => {
    before(async () => {
        await deploy();
        const addConopsTx = await conops.addConops(
            "test1",
            "with 4 plots",
            "with 5 plots",
            "with flag",
            "with 1 person",
            ["CHU A", "BASE B"],
            [0, 2],
            4,
            5
        );

        await addConopsTx.wait();
    });

    it("should disable conops", async () => {
        // const disableConopsTx = await conops.disable(0);
        // await disableConopsTx.wait();
        await expect(conops.disable(0))
            .to.emit(conops, "ConopsDisable")
            .withArgs(0);
        // eslint-disable-next-line no-unused-expressions
        expect((await conops.viewConops(0)).activated).to.be.false;
    });

    it("should enable conops", async () => {
        const enableConopsTx = await conops.enable(0);
        await enableConopsTx.wait();
        // eslint-disable-next-line no-unused-expressions
        expect((await conops.viewConops(0)).activated).to.be.true;
    });
});
