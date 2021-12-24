const { expect } = require("chai");
const { ethers } = require("hardhat");

const DEFAULT_ADMIN_ROLE =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
const ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
const OTHER_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("PILOT_ROLE")
);

describe("SWAccessControl", function () {
    let accessControl, admin, authorized, other, otherAdmin;

    beforeEach(async () => {
        [admin, authorized, other, otherAdmin] = await ethers.getSigners();
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
                accessControl.connect(other).grantRole(ROLE, authorized.address)
            ).to.be.revertedWith(
                `AccessControl: account ${other.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
            );
        });

        it("accounts can be granted a role multiple times", async function () {
            await accessControl.grantRole(ROLE, authorized.address);
            await expect(
                accessControl.grantRole(ROLE, authorized.address)
            ).to.not.emit(accessControl, "RoleGranted");
        });
    });

    describe("revoking", function () {
        it("roles that are not had can be revoked", async function () {
            expect(
                await accessControl.hasRole(ROLE, authorized.address)
            ).to.equal(false);

            await expect(
                accessControl.revokeRole(ROLE, authorized.address)
            ).to.not.emit(accessControl, "RoleRevoked");
        });

        context("with granted role", function () {
            beforeEach(async function () {
                await accessControl.grantRole(ROLE, authorized.address);
            });

            it("admin can revoke role", async function () {
                await expect(accessControl.revokeRole(ROLE, authorized.address))
                    .to.emit(accessControl, "RoleRevoked")
                    .withArgs(ROLE, authorized.address, admin.address);

                expect(
                    await accessControl.hasRole(ROLE, authorized.address)
                ).to.equal(false);
            });

            it("non-admin cannot revoke role", async function () {
                await expect(
                    accessControl
                        .connect(other)
                        .revokeRole(ROLE, authorized.address)
                ).to.be.revertedWith(
                    `AccessControl: account ${other.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
                );
            });

            it("a role can be revoked multiple times", async function () {
                await accessControl.revokeRole(ROLE, authorized.address);

                await expect(
                    accessControl.revokeRole(ROLE, authorized.address)
                ).to.not.emit(accessControl, "RoleRevoked");
            });
        });
    });

    describe("renouncing", function () {
        it("roles that are not had can be renounced", async function () {
            await expect(
                accessControl
                    .connect(authorized)
                    .renounceRole(ROLE, authorized.address)
            ).to.not.emit(accessControl, "RoleRevoked");
        });

        context("with granted role", function () {
            beforeEach(async function () {
                await accessControl.grantRole(ROLE, authorized.address);
            });

            it("bearer can renounce role", async function () {
                await expect(
                    accessControl
                        .connect(authorized)
                        .renounceRole(ROLE, authorized.address)
                )
                    .to.emit(accessControl, "RoleRevoked")
                    .withArgs(ROLE, authorized.address, authorized.address);

                expect(
                    await accessControl.hasRole(ROLE, authorized.address)
                ).to.equal(false);
            });

            it("only the sender can renounce their roles", async function () {
                await expect(
                    accessControl.renounceRole(ROLE, authorized.address)
                ).to.be.revertedWith(
                    `AccessControl: can only renounce roles for self`
                );
            });

            it("a role can be renounced multiple times", async function () {
                await accessControl
                    .connect(authorized)
                    .renounceRole(ROLE, authorized.address);

                await expect(
                    accessControl
                        .connect(authorized)
                        .renounceRole(ROLE, authorized.address)
                ).to.not.emit(accessControl, "RoleRevoked");
            });
        });
    });

    describe("setting role admin", function () {
        beforeEach(async function () {
            await expect(accessControl.setRoleAdmin(ROLE, OTHER_ROLE))
                .to.emit(accessControl, "RoleAdminChanged")
                .withArgs(ROLE, DEFAULT_ADMIN_ROLE, OTHER_ROLE);

            await accessControl.grantRole(OTHER_ROLE, otherAdmin.address);
        });

        it("a role's admin role can be changed", async function () {
            expect(await accessControl.getRoleAdmin(ROLE)).to.equal(OTHER_ROLE);
        });

        it("the new admin can grant roles", async function () {
            await expect(
                accessControl
                    .connect(otherAdmin)
                    .grantRole(ROLE, authorized.address)
            )
                .to.emit(accessControl, "RoleGranted")
                .withArgs(ROLE, authorized.address, otherAdmin.address);
        });

        it("the new admin can revoke roles", async function () {
            await accessControl
                .connect(otherAdmin)
                .grantRole(ROLE, authorized.address);

            await expect(
                accessControl
                    .connect(otherAdmin)
                    .revokeRole(ROLE, authorized.address)
            )
                .to.emit(accessControl, "RoleRevoked")
                .withArgs(ROLE, authorized.address, otherAdmin.address);
        });

        it("a role's previous admins no longer grant roles", async function () {
            await expect(
                accessControl.grantRole(ROLE, authorized.address)
            ).to.be.revertedWith(
                `AccessControl: account ${admin.address.toLowerCase()} is missing role ${OTHER_ROLE}`
            );
        });

        it("a role's previous admins no longer revoke roles", async function () {
            await expect(
                accessControl.revokeRole(ROLE, authorized.address)
            ).to.be.revertedWith(
                `AccessControl: account ${admin.address.toLowerCase()} is missing role ${OTHER_ROLE}`
            );
        });
    });
});
