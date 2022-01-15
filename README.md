# <img src="./docs/img/drone.png" height="30"> Starwings <img src="./docs/img/drone.png" height="30">

## <u>Presentation</u>

This is the final project for our Blockchain training @ Alyra

The purpose of this project is to offer certification on drones flights data for deliveries.

/!\ Project is still under development /!\

## <u>Team</u>

Managers:

-   Jean-Philippe BONHOMME
-   François BROBECK

Developers:

-   [Dé Yi BANH](https://github.com/deyibanh)
-   [Fabien FRICK](https://github.com/lostmind84)
-   [Damien SABOURAUD](https://github.com/MB2M)

&nbsp;

# <img src="./docs/img/coding.png" height="25"> Dapp Setup

## 1.Install

To install the project, open a terminal at the root folder and execute :<br />
`$> npm install && npx hardhat compile && cd client && npm install`

&nbsp;

## 2.Configuration

Create your own `.env` file and add your parameters (there is a .env-example file that you can copy):

-   `MNEMONIC`: Your mnemonic.
-   `OPTIMISM_API_KEY`: Paste your Etherscan for Optimism API key. (https://optimistic.etherscan.io/myapikey) Used for Optimism testnet deployment

&nbsp;

## 3. Deployment

We use Hardhat to deploy the smart contracts.

### 3.1 Compile smart contracts:<br />

`$> npx hardhat compile`

### 3.2 Deploy smart contracts :

> **On local Hardhat network:<br />**
> Open a terminal and run : <br /> >`$> npx hardhat node`<br />
> Open another terminal and run : <br /> >`$> npx hardhat run scripts/deploy.js`

> **On live network (mainnet, ropsten, etc..):<br />**
> Open a terminal and run : <br /> >`$> npx hardhat run scripts/deploy.js --network <YOUR NETWORK NAME>`

&nbsp;

## 4. Start client

Once contracts are deployed, you can start the client :<br/>
`>$ cd client; npm start`

&nbsp;

## 5. Docs

Developers documentation:

-   [Avoiding Common Attacks](./docs/developers/avoiding_common_attacks.md)
-   [Deployed Addresses](./docs/developers/deployed_addresses.md)
-   [Design Pattern Decisions](./docs/developers/design_pattern_decisions.md)
-   [Natspec](./docs/developers/natspec.md)
-   [Test Explication](./docs/developers/test_explication.md)

&nbsp;

## Copyright & License

License MIT<br />

Copyright (C) 2022
