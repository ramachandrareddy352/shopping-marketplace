// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IFactory {
    function isAcceptableCollateral(address _tokenAddress) external view returns (bool);
    function getPriceFeed(address _tokenAddress) external view returns (address);

    function createMarketplace(
        string memory _name,
        string memory _symbol,
        address _marketOwner,
        address[] memory _collateralTokens
    ) external payable returns (uint256);

    function transferMarketPlaceOwner(
        uint256 _marketId, 
        address _marketplace, 
        address _newOwner, 
        address _ownerCall
    ) external;
}
