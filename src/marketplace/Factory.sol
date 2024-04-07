// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import {MarketPlace} from "./MarketPlace.sol";
import {MarketItems} from "./MarketItems.sol";
import {TransferHelper} from "../helper/TransferHelper.sol";
import {IOwnable} from "../interfaces/IOwnable.sol";

contract Factory is Ownable, ReentrancyGuard, TransferHelper, Pausable {
    event CreateMarketplace(
        uint256 indexed marketId, address indexed marketPlace, address marketItems, address indexed createdBy
    );
    event MarketPlaceOwnerChanged(address indexed marketPlace, address indexed newOwner, address indexed oldOwner);

    uint256 private constant ROYALTY_FEE = 3000; // for every product buying factory takes 0.3% of fee.
    uint256 private constant MARKET_FEE = 1 * 10 ** 18; // to create a market, they should have to pay 1 matic.

    struct MarketData {
        address marketPlace;
        address marketItems;
        address owner;
    }

    uint256 private marketIdTracker;

    mapping(uint256 marketId => MarketData) private marketPlaceTracker;
    mapping(address owner => uint256[] marketIds) private ownerMarkets;
    mapping(address => bool) private blackList;
    mapping(address => bool) private collateralTokens;
    mapping(address collateral => address pricefeed) private priceFeed;

    constructor(address _owner, address[] memory _collateralTokens, address[] memory _pricefeeds) Ownable(_owner) {
        for (uint256 i = 0; i < _collateralTokens.length; i++) {
            collateralTokens[_collateralTokens[i]] = true;
            priceFeed[_collateralTokens[i]] = _pricefeeds[i];
        }
    }

    function createMarketplace(
        string memory _name,
        string memory _symbol,
        address _marketOwner,
        address[] memory _collateralTokens
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        require(!blackList[msg.sender], "Factory : Not allowed to this user");
        require(msg.value == MARKET_FEE, "Factory : Insufficient amount to create market");
        require(_marketOwner != address(0) && _marketOwner != address(this), "Factory : Invalid zero address");
        require(_collateralTokens.length > 0 && _checkCollaterals(_collateralTokens), "Factory : Unsupported token");

        uint256 marketId = ++marketIdTracker; // id starts from - 1

        address marketItem = address(new MarketItems(_name, _symbol, address(this)));
        address marketPlace = address(new MarketPlace(marketItem, _marketOwner, address(this), _collateralTokens));

        IOwnable(marketItem).transferOwnership(marketPlace);

        marketPlaceTracker[marketId] = MarketData(marketPlace, marketItem, _marketOwner);
        ownerMarkets[_marketOwner].push(marketId);

        emit CreateMarketplace(marketId, marketPlace, marketItem, _marketOwner);
        return marketId;
    }

    function transferMarketPlaceOwner(uint256 _marketId, address _marketplace, address _newOwner, address _ownerCall)
        external
        whenNotPaused
        nonReentrant
    {
        require(!blackList[msg.sender] && !blackList[_ownerCall], "Factory : User not allowed");
        require(_marketplace != address(this) && _newOwner != address(this), "Factory : Can't set factory as new owner");

        uint256[] memory ids = ownerMarkets[_ownerCall];
        uint256 marketIndex = type(uint256).max;

        for (uint256 i = 0; i < ids.length; i++) {
            if (ids[i] == _marketId) {
                marketIndex = i;
                break;
            }
        }

        require(marketIndex < ids.length, "Factory : market id not found");
        // removing the market id from owner market list
        ownerMarkets[_ownerCall][marketIndex] = ownerMarkets[_ownerCall][ids.length];
        ownerMarkets[_ownerCall].pop();

        // adding market id to new owner
        ownerMarkets[_newOwner].push(_marketId);

        marketPlaceTracker[_marketId].owner = _newOwner;

        IOwnable(_marketplace).transferOwnership(_newOwner);
        emit MarketPlaceOwnerChanged(_marketplace, _newOwner, msg.sender);
    }

    function addBlackList(address[] memory list) external onlyOwner {
        // can we add zero address to black list
        for (uint256 i = 0; i < list.length; i++) {
            blackList[list[i]] = true;
        }
    }

    function removeBlackList(address[] memory list) external onlyOwner {
        for (uint256 i = 0; i < list.length; i++) {
            delete blackList[list[i]];
        }
    }

    function addCollateralToken(address _collateralToken, address _pricefeed) external onlyOwner {
        collateralTokens[_collateralToken] = true;
        priceFeed[_collateralToken] = _pricefeed;
    }

    function removeCollateralToken(address _collateralToken) external onlyOwner {
        delete collateralTokens[_collateralToken];
        delete priceFeed[_collateralToken];
    }

    function withdrawERC20(address _token, address _to, uint256 _value) external onlyOwner {
        require(_to != address(0) && _token != address(0), "Factory : Inavlid zero address");
        require(IERC20(_token).balanceOf(address(this)) >= _value, "Factory : Insufficent balance to withdraw");
        _safeTransferERC20(_token, _to, _value);
    }

    function withdrawNative(address _to, uint256 _amount, bytes memory _data)
        external
        onlyOwner
        whenNotPaused
        returns (bytes memory)
    {
        require(_to != address(0), "Factory : Inavlid zero address");
        require(address(this).balance >= _amount, "Factory : Insufficient balance to withdraw");

        (bool success, bytes memory data) = payable(_to).call{value: _amount}(_data);
        require(success, "Factory : Withdraw failed");
        return data;
    }

    function _checkCollaterals(address[] memory _tokens) private view returns (bool) {
        for (uint256 i = 0; i < _tokens.length; i++) {
            if (!collateralTokens[_tokens[i]]) {
                return false;
            }
        }
        return true;
    }

    function pauseFunctions() external onlyOwner {
        _pause();
    }

    function unpauseFunctions() external onlyOwner {
        _unpause();
    }

    function isAcceptableCollateral(address _tokenAddress) public view returns (bool) {
        return collateralTokens[_tokenAddress];
    }

    function getPriceFeed(address _tokenAddress) public view returns (address) {
        require(isAcceptableCollateral(_tokenAddress), "Factory : Collateral token is not accepted");
        return priceFeed[_tokenAddress];
    }
}
