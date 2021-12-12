# Alyra Final Project

## Presentation

This is our Alyra Final Project!<br />
Let's go to the Moon!

## Team

Managers:

-   Jean-Philippe BONHOMME
-   François BROBECK

Developers:

-   [Dé Yi BANH](https://github.com/deyibanh)
-   Fabien FRICK
-   Damien SABOURAUD

## Install

To install the project, just launch:<br />
`$> npm install`

## Configuration

Configure the project by copying the variable environment from the `env.dist` file.<br />
Then create your own `.env` file and add your parameters:

-   `ETHERSCAN_API_KEY`: The Etherscan API Key.
-   `INFURA_ROPSTEN_URL`: Paste the Infura Ropsten URL and specify the Infura ID.
-   `PRIVATE_KEY`: The account private key that will be used to deploy.

## Deployment

We use Hardhat to deploy the smart contracts.

To compile smart contracts:<br />
`npx hardhat run scripts/deploy.js`

To deploy smart contracts on local Hardhat network:<br />
`npx hardhat run scripts/deploy.js`

To deploy smart contracts on specific network (like ropsten or mainnet):<br />
`npx hardhat run scripts/deploy.js --network <YOUR NETWORK NAME>`

## Docs

Developers documentation:

-   [Avoiding Common Attacks](./docs/developers/avoiding_common_attacks.md)
-   [Deployed Addresses](./docs/developers/deployed_addresses.md)
-   [Design Pattern Decisions](./docs/developers/design_pattern_decisions.md)
-   [Natspec](./docs/developers/natspec.md)
-   [Test Explication](./docs/developers/test_explication.md)

## Copyright & License

License MIT<br />
Copyright (C) 2021
