import { ethers } from "ethers";

const getEthersProvider = () =>
    new Promise((resolve, reject) => {
        // Wait for loading completion to avoid race conditions with web3 injection timing.
        window.addEventListener("load", async () => {
            // Modern dapp browsers...
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);

                try {
                    // Request account access if needed
                    // await window.ethereum.enable();
                    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

                    // Accounts now exposed
                    resolve(provider);
                } catch (error) {
                    reject(error);
                }
            }
            // Fallback to localhost; use dev console port by default...
            else {
                const provider = new ethers.providers.JsonRpcProvider();
                console.error("No web3 instance injected, using Local web3.");
                resolve(provider);
            }
        });
    });

export default getEthersProvider;
