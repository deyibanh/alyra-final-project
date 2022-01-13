# Alyra Final Project - :ledger: Test Explication

## Tests commands

-   Launch test with Hardhat:
    `$> npx hardhat test`

-   Launch test to a specific folder/file with Hardhat:
    `$> npx hardhat test <FOLDER_PATH/FILE_PATH>`

## `Conops`

-   Should return the added conops
-   should revert with proper message

## `Conops activation`

-   should disable conops
-   should enable conops

## `DeliveryManager`

-   should create new delivery (38ms)
-   should get delivery
-   should updateStatus
-   should get all deliveries

## `DroneFlight`

Checks

-   Should set preflight check_id 0 to true
-   Should set postfligfht check_id 1 to true
    AirRisk validation
-   Should validate and cancel an air Risk with id 1
    events
-   Should add an Engine risk event with timestamp 547856
    parcel management
-   should be picked up parcel
-   Should revert as parcel was already picked up
-   Should revert as parcel was not pickedup before delivery
-   should deliver the parcel
    flight status
-   Should revert as status sent is 1
-   Should revert due to flight not allowed
-   Should revert as status 6 is outside range
-   Should cancel a flight
    with flight allowed
-   Should change piloteflightstatus to 2
-   Should change droneflightstatus to 2
-   Should revert due to flight not started (as pilot)
-   Should revert due to flight not started (as drone)
-   Should pause a flight from pilot
-   Should pause a flight from drone

## `DroneFlightFactory`

-   Should revert due to caller not pilot
-   Should deploy 2 new DroneDelivery contract (211ms)

## `StarwingsMaster`

Get DroneFlight

-   should not get the DroneFlightFactory address if sender has not the admin role.
-   should set the DroneFlightFactory address.
-   should not set the DroneFlightFactory address if sender has not the admin role.
-   should get the list of DroneFlight address.
-   should not get the list of DroneFlight address if sender has not the admin role.
-   should not get the DroneFlight address if sender has not the admin role.
    Pilot
-   should not get the list of Pilot if sender has not the admin role.
-   should not get the Pilot if sender has not the admin role.
-   should not get the Pilot if Pilot index out of the list size.
-   should not get the Pilot if Pilot not exist.
-   should add a Pilot if it is a new address. (48ms)
-   should add a Pilot if the pilot has been deleted. (44ms)
-   should not add a Pilot if sender has not the admin role.
-   should not add a Pilot if it is not a new address and it has not been deleted.
-   should delete a Pilot. (56ms)
-   should not delete a Pilot if sender has not the admin role.
-   should not delete the Pilot if Pilot not exist. (65ms)
-   should not delete the Pilot if Pilot index out of the list size.
-   should not get the Pilot index if sender has not the admin role.
    Drone
-   should not get the list of Drone if sender has not the admin role.
-   should not get the Drone if sender has not the admin role.
-   should not get the Drone if Drone index out of the list size.
-   should not get the Drone if Drone not exist.
-   should add a Drone if it is a new address. (54ms)
-   should add a Drone if the Drone has been deleted. (52ms)
-   should not add a Drone if sender has not the admin role.
-   should not add a Drone if it is not a new address and it has not been deleted.
-   should delete a Drone. (66ms)
-   should not delete a Drone if sender has not the admin role.
-   should not delete a Drone if sender has not the admin role.
-   should not delete the Drone if Drone not exist.
-   should not get the Drone index if sender has not the admin role.
    Contracts
-   should get the AccessControl address.
-   should get the ConopsManager address.
-   should get the DeliveryManager address.

## `SWAccessControl`

default admin

-   deployer has default admin role
-   other roles's admin is the default admin role
-   default admin role's admin is itself
    granting
-   non-admin cannot grant role to other accounts
-   accounts can be granted a role multiple times
    revoking
-   roles that are not had can be revoked
    with granted role
-   admin can revoke role
-   non-admin cannot revoke role
-   a role can be revoked multiple times
    renouncing
-   roles that are not had can be renounced
    with granted role
-   bearer can renounce role
-   only the sender can renounce their roles
-   a role can be renounced multiple times
    setting role admin
-   a role's admin role can be changed
-   the new admin can grant roles
-   the new admin can revoke roles
-   a role's previous admins no longer grant roles
-   a role's previous admins no longer revoke roles

84 passing

| File                   | % Stmts   | % Branch  | % Funcs   | % Lines   | Uncovered Lines |
| ---------------------- | --------- | --------- | --------- | --------- | --------------- |
| contracts/             | 98.69     | 73.39     | 95.65     | 98.73     |                 |
| ConopsManager.sol      | 100       | 60        | 100       | 100       |                 |
| DeliveryManager.sol    | 100       | 50        | 100       | 100       |                 |
| DroneDelivery.sol      | 88.89     | 100       | 77.78     | 88.89     | 54,99           |
| DroneFlight.sol        | 100       | 75        | 100       | 100       |                 |
| DroneFlightFactory.sol | 100       | 100       | 100       | 100       |                 |
| SWAccessControl.sol    | 100       | 100       | 100       | 100       |                 |
| StarwingsMaster.sol    | 98.75     | 82.69     | 95        | 98.77     | 183             |
| contracts/interfaces/  | 100       | 100       | 100       | 100       |                 |
| IConopsManager.sol     | 100       | 100       | 100       | 100       |                 |
| IDeliveryManager.sol   | 100       | 100       | 100       | 100       |                 |
| IDroneFlight.sol       | 100       | 100       | 100       | 100       |                 |
| IStarwingsMaster.sol   | 100       | 100       | 100       | 100       |                 |
| contracts/librairies/  | 100       | 100       | 100       | 100       |                 |
| StarwingsDataLib.sol   | 100       | 100       | 100       | 100       |                 |
| **All files**          | **98.69** | **73.39** | **95.65** | **98.73** |                 |
