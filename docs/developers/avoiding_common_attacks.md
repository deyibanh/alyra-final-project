# Alyra Final Project - Avoiding Common Attacks

# External Calls

### `Avoid state changes after external calls`

Contracts that need to check for address role in a modifier are calling the trusted contract AccessControl.

DroneFlight contract call an external view function of the trusted contract ConopsManager.

DroneFlightFactory contract call an external view function of the trusted contract StarwingsMaster.

### `Be aware of the tradeoffs between send(), transfer(), and call.value()`

Not applicable.

### `Handle errors in external calls`

Not applicable.

### `Favor pull over push for external calls`

Not applicable.

### `Don't assume contracts are created with zero balance`

This is not assumed anywhere, there is no withdrawals in our contracts

### `Remember that on-chain data is public`

In our POC version we asume that all data will be public.
In MVP and production we will use solution that will manage privacy of data

### `In 2-party or N-party contracts, beware of the possibility that some participants may "drop offline" and not return`

    -- customer alert if drone go offline during his flight? --

### `Avoid using tx.origin`

tx.origin is not used.

### `Timestamp Dependence`

Timestamps are only used to generate IDs. The goal is for these to be unique, and they do not have any security implications.

### `Use interface type instead of the address for type safety`

We use interfaces to make external call.

### `Avoid using extcodesize to check for Externally Owned Accounts`

Not applicable.

# Exploits

### `Arithmetic Overflow and Underflow`

We are using solidity > 0.8.9, and this is now integrated into the compiler.

### `Self Destruct`

We do not manage balances with assets so it doesn't apply.

### `Delegatecall`

We don't use it.

### `Source of Randomness`

We use block.timestamp but carrefully, mixed with other values in a non sensitive field.

#

Sources:

-   https://consensys.github.io/smart-contract-best-practices/recommendations/
-   https://solidity-by-example.org/ (part:Hacks)
