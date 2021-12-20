const { expect, expectRevert, expectEvent } = require("chai");
const { ethers } = require("hardhat");

const DEFAULT_ADMIN_ROLE =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
const ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
const OTHER_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("PILOT_ROLE")
);

describe("SWAccessControl", function () {
    let accessControl, admin, authorized, other, otherAdmin, otherAuthorized;

    beforeEach(async () => {
        [admin, authorized, other, otherAdmin, otherAuthorized] = await ethers.getSigners();
        const AccessControl = await ethers.getContractFactory(
            "SWAccessControl"
        );
        accessControl = await AccessControl.deploy();
        await accessControl.deployed();
    });

    describe("default admin", function () {
        it("deployer has default admin role", async function () {
            expect(
                await accessControl.hasRole(DEFAULT_ADMIN_ROLE, admin.address)
            ).to.equal(true);
        });

        it("other roles's admin is the default admin role", async function () {
            expect(await accessControl.getRoleAdmin(ROLE)).to.equal(
                DEFAULT_ADMIN_ROLE
            );
        });

        it("default admin role's admin is itself", async function () {
            expect(
                await accessControl.getRoleAdmin(DEFAULT_ADMIN_ROLE)
            ).to.equal(DEFAULT_ADMIN_ROLE);
        });
    });

    describe("granting", function () {
        beforeEach(async function () {
            await accessControl.grantRole(ROLE, authorized.address);
        });

        it("non-admin cannot grant role to other accounts", async function () {
            await expect(
                accessControl.connect(other).grantRole(ROLE, authorized.address)).to.be.revertedWith(
                `AccessControl: account ${other.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
            );
        });

        it("accounts can be granted a role multiple times", async function () {
            await accessControl.grantRole(ROLE, authorized.address);
            const receipt = await accessControl.grantRole(
                ROLE,
                authorized.address
            );
            // expectEvent.notEmitted(receipt, "RoleGranted");
        });
    });

    describe("revoking", function () {
        it("roles that are not had can be revoked", async function () {
            expect(await accessControl.hasRole(ROLE, authorized.address)).to.equal(
                false
            );

            const receipt = await accessControl.revokeRole(
                ROLE,
                authorized.address
            );
            // expectEvent.notEmitted(receipt, "RoleRevoked");
        });

        context("with granted role", function () {
            beforeEach(async function () {
                await accessControl.grantRole(ROLE, authorized.address);
            });

            it("admin can revoke role", async function () {
                const receipt = await accessControl.revokeRole(
                    ROLE,
                    authorized.address
                );
                // expectEvent(receipt, "RoleRevoked", {
                //     account: authorized,
                //     role: ROLE,
                //     sender: admin,
                // });

                expect(
                    await accessControl.hasRole(ROLE, authorized.address)
                ).to.equal(false);
            });

            it("non-admin cannot revoke role", async function () {
                await expect(
                    accessControl.connect(other).revokeRole(ROLE, authorized.address)).to.be.revertedWith(
                    `AccessControl: account ${other.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
                );
            });

            it("a role can be revoked multiple times", async function () {
                await accessControl.revokeRole(ROLE, authorized.address);

                const receipt = await accessControl.revokeRole(
                    ROLE,
                    authorized.address
                );
                // expectEvent.notEmitted(receipt, "RoleRevoked");
            });
        });
    });

    describe("renouncing", function () {
        it("roles that are not had can be renounced", async function () {
            const receipt = await accessControl.connect(authorized).renounceRole(
                ROLE,
                authorized.address);
            // expectEvent.notEmitted(receipt, "RoleRevoked");
        });

        context("with granted role", function () {
            beforeEach(async function () {
                await accessControl.grantRole(ROLE, authorized.address);
            });

            it("bearer can renounce role", async function () {
                const receipt = await accessControl.connect(authorized).renounceRole(
                    ROLE,
                    authorized.address
                );
                // expectEvent(receipt, "RoleRevoked", {
                //     account: authorized,
                //     role: ROLE,
                //     sender: authorized,
                // });

                expect(
                    await accessControl.hasRole(ROLE, authorized.address)
                ).to.equal(false);
            });

            it("only the sender can renounce their roles", async function () {
                await expect(
                    accessControl.renounceRole(ROLE, authorized.address)).to.be.revertedWith(
                    `AccessControl: can only renounce roles for self`
                );
            });

            it("a role can be renounced multiple times", async function () {
                await accessControl.connect(authorized).renounceRole(ROLE, authorized.address);

                const receipt = await accessControl.connect(authorized).renounceRole(
                    ROLE,
                    authorized.address
                );
                // expectEvent.notEmitted(receipt, "RoleRevoked");
            });
        });
    });

    // describe("setting role admin", function () {
    //     beforeEach(async function () {
    //         const receipt = await accessControl.setRoleAdmin(
    //             ROLE,
    //             OTHER_ROLE
    //         );
    //         // expectEvent(receipt, "RoleAdminChanged", {
    //         //     role: ROLE,
    //         //     previousAdminRole: DEFAULT_ADMIN_ROLE,
    //         //     newAdminRole: OTHER_ROLE,
    //         // });

    //         await accessControl.grantRole(OTHER_ROLE, otherAdmin.address);
    //     });

    //     it("a role's admin role can be changed", async function () {
    //         expect(await accessControl.getRoleAdmin(ROLE)).to.equal(
    //             OTHER_ROLE
    //         );
    //     });

    //     it("the new admin can grant roles", async function () {
    //         const receipt = await accessControl.connect(otherAdmin).grantRole(
    //             ROLE,
    //             authorized.address
    //         );
    //         // expectEvent(receipt, "RoleGranted", {
    //         //     account: authorized,
    //         //     role: ROLE,
    //         //     sender: otherAdmin,
    //         // });
    //     });

    //     it("the new admin can revoke roles", async function () {
    //         await accessControl.connect(otherAdmin).grantRole(ROLE, authorized.address);
    //         const receipt = await accessControl.connect(otherAdmin).revokeRole(
    //             ROLE,
    //             authorized.address
    //         );
    //         // expectEvent(receipt, "RoleRevoked", {
    //         //     account: authorized,
    //         //     role: ROLE,
    //         //     sender: otherAdmin,
    //         // });
    //     });

    //     it("a role's previous admins no longer grant roles", async function () {
    //         await expect(
    //             accessControl.grantRole(ROLE, authorized.address)).to.be.revertedWith(
    //             `AccessControl: account ${admin.address.toLowerCase()} is missing role ${OTHER_ROLE}`
    //         );
    //     });

    //     it("a role's previous admins no longer revoke roles", async function () {
    //         await expect(
    //             accessControl.revokeRole(ROLE, authorized.address)).to.be.revertedWith(
    //             `AccessControl: account ${admin.address.toLowerCase()} is missing role ${OTHER_ROLE}`
    //         );
    //     });
    // });
    // describe("onlyRole modifier", function () {
    //     beforeEach(async function () {
    //         await accessControl.grantRole(ROLE, authorized.address);
    //     });

    //     it("do not revert if sender has role", async function () {
    //         await accessControl.connect(authorized).senderProtected(ROLE);
    //     });

    //     it("revert if sender doesn't have role #1", async function () {
    //         await expectRevert(
    //             accessControl.connect(other).senderProtected(ROLE),
    //             `AccessControl: account ${other.address.toLowerCase()} is missing role ${ROLE}`
    //         );
    //     });

    //     it("revert if sender doesn't have role #2", async function () {
    //         await expectRevert(
    //             accessControl.connect(authorized).senderProtected(OTHER_ROLE),
    //             `AccessControl: account ${authorized.address.toLowerCase()} is missing role ${OTHER_ROLE}`
    //         );
    //     });
    // });
});
