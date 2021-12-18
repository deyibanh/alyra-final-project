const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Conops", function () {
    let conops, owner, addr1;

    beforeEach(async () => {
        const Conops = await ethers.getContractFactory("Conops");
        conops = await Conops.deploy();
        await conops.deployed();
        [owner, addr1] = await ethers.getSigners();
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

        let returnedConops = await conops.viewConops(0);

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
        ).to.be.revertedWith("not admin or owner");
    });
});

describe("Conops activation", () => {
    let conops, owner, addr1;

    before(async () => {
        const Conops = await ethers.getContractFactory("Conops");
        conops = await Conops.deploy();
        await conops.deployed();
        [owner, addr1] = await ethers.getSigners();
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

    it("should suspend conops", async () => {
        const disableConopsTx = await conops.suspend(0);
        await disableConopsTx.wait();
        expect((await conops.viewConops(0)).activated).to.be.false;
    });

    it("should activate conops", async () => {
        const activateConopsTx = await conops.activate(0);
        await activateConopsTx.wait();
        expect((await conops.viewConops(0)).activated).to.be.true;
    });
});
