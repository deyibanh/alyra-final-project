import { ethers } from "ethers";

// deterministically computes the smart contract address given
// the account the will deploy the contract (factory contract)
// the salt as uint256 and the contract bytecode
function buildCreate2Address(creatorAddress, saltHex, byteCode) {
    return `0x${ethers.utils
        .keccak256(
            `0x${["ff", creatorAddress, saltHex, ethers.utils.keccak256(byteCode)]
                .map((x) => x.replace(/0x/, ""))
                .join("")}`
        )
        .slice(-40)}`.toLowerCase();
}

// converts an int to uint256
function numberToUint256(value) {
    const hex = value.toString(16);
    return `0x${"0".repeat(64 - hex.length)}${hex}`;
}

// encodes parameter to pass as contract argument
function encodeParam(dataType, data) {
    const abiCoder = ethers.utils.defaultAbiCoder;
    return abiCoder.encode([dataType], [data]);
}

// returns true if contract is deployed on-chain
// async function isContract(address) {
//     const code = await ethers.provider.getCode(address);
//     return code.slice(2).length > 0;
// }

export { buildCreate2Address, numberToUint256, encodeParam };
