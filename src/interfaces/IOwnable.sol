// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IOwnable {
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function transferOwnership(address newOwner) external;
}
