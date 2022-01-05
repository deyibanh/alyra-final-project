# Alyra Final Project - Design Pattern Decisions


## Main Patern

StarwingsMaster will keep main data over:

    - pilots,
    - drones,
    - flight,
    - others contracts addresses

As we will need to make new version, we kept things the most independant possible.
We can update each process independantly and refer to the new verison using StarwingsMaster.

For example, each flight will have his personnal contract (we use a factory 'DroneflightFactory'). Each necessary informations will be stored in a smart contract and so consultation may not depend of the version of the Dapp.

Access to the app will be managed with a specific contract 'AccesControl'.
