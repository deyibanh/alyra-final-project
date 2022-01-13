// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {StarwingsDataLib} from "../librairies/StarwingsDataLib.sol";

interface IDroneFlight {
    function setFlightData(StarwingsDataLib.FlightData memory data) external;
}
