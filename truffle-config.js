const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
    contracts_build_directory: path.join(__dirname, "client/src/contracts"),
    networks: {
        development: {
            host: `${process.env.NETWORK_DEVELOPMENT_HOST}`,
            port: `${process.env.NETWORK_DEVELOPMENT_PORT}`,
            network_id: "*",
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(`${process.env.MNEMONIC}`, `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`)
            },
            network_id: 3,
        }
    },
    mocha: {
        // timeout: 100000
    },
    compilers: {
        solc: {
            version: "0.8.9",
            settings: {
                optimizer: {
                    enabled: false,
                    runs: 200
                }
            }
        }
    }
};
