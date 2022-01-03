/* eslint-disable no-undef */
const { expect } = require("chai");

let deliveryManager, accessControl, owner, from, to;

const deploy = async () => {
    [owner, from, to] = await ethers.getSigners();

    // Deploy lib
    const lib = await ethers.getContractFactory("StarwingsDataLib");
    const libDeployed = await lib.deploy();

    // Deploy AccessControl
    const AccessControl = await ethers.getContractFactory("SWAccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.deployed();

    await accessControl.grantRole(
        await libDeployed.ADMIN_ROLE(),
        owner.address
    );

    // const hasRoleAdmin = await accessControl.hasRole(
    //     await libDeployed.ADMIN_ROLE(),
    //     owner.address
    // );
    // console.log(`Owner has role admin:${hasRoleAdmin}`);

    // Deploy deliveryManager
    // deliveryManager = await deployContract(owner, DeliveryManager, [
    //     accessControl.address,
    // ]);
    const DeliveryManager = await ethers.getContractFactory("DeliveryManager");
    deliveryManager = await DeliveryManager.deploy(accessControl.address);
    await deliveryManager.deployed();
};

describe("== DeliveryManager", function () {
    let currentDeliveryId = "";

    before(async () => {
        await deploy();
    });

    it("should create new delivery", async () => {
        const delivery = {
            deliveryId: "",
            supplierOrderId: "A47G-78",
            state: 0,
            from: "From1",
            fromAddr: from.address,
            to: "To1",
            toAddr: to.address,
            fromHubId: "007",
            toHubId: "0056",
        };

        // Utiliser callStatic pour les méthodes qui changent le state
        //  pour simuler le changement (ne change pas réellement le state)
        // const deliveryId = await deliveryManager
        //     .connect(owner)
        //     .callStatic.newDelivery(delivery);
        // let deliveryId = await deliveryManager
        //     .connect(owner)
        //     .newDelivery(delivery);
        // deliveryId = await deliveryId.wait();

        const result = await deliveryManager
            .connect(owner)
            .newDelivery(delivery);

        // Get event values
        const temp = await result.wait();
        currentDeliveryId = temp.events?.filter((x) => {
            return x.event === "DeliveryCreated";
        })[0].args.deliveryId;

        expect(result)
            .to.emit(deliveryManager, "DeliveryCreated")
            .withArgs(currentDeliveryId);

        // result = await result.wait();
        // console.log(
        //     result.events?.filter((x) => {
        //         return x.event === "DeliveryCreated";
        //     })[0].args.deliveryId
        // );

        // console.log(deliveryId);
        // console.log(`newDelivery created with ID:${deliveryId}`);
    });

    it("should get delivery", async () => {
        const result = await deliveryManager.getDelivery(currentDeliveryId);
        expect(result.deliveryId).to.equal(currentDeliveryId);
    });

    it("should updateStatus", async () => {
        const result = await deliveryManager.getDelivery(currentDeliveryId);
        const oldStatus = result.state;
        const newStatus = 1;

        const result2 = await deliveryManager
            .connect(owner)
            .setDeliveryState(currentDeliveryId, newStatus);

        expect(result2)
            .to.emit(deliveryManager, "DeliveryStatusUpdated")
            .withArgs(currentDeliveryId, oldStatus, newStatus);
    });

    it("should get all deliveries", async () => {
        const result = await deliveryManager.getAllDeliveries();
        expect(result.length).to.be.greaterThan(0);
    });
});
