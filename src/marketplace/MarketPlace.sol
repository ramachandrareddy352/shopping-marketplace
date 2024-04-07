// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import {IMarketItems} from "../interfaces/IMarketItems.sol";
import {IFactory} from "../interfaces/IFactory.sol";
import {AggregatorV3Interface} from "../interfaces/AggregatorV3Interface.sol";
import {TransferHelper} from "../helper/TransferHelper.sol";

contract MarketPlace is Ownable, ReentrancyGuard, Pausable, TransferHelper {
    event ProductCreated(uint256 indexed productId, uint256 quantity, uint256 price, address[] collateralTokens);
    event RemoveProduct(uint256 indexed productId);
    event MarketItemBought(uint256 indexed tokenId, uint256 indexed productId, uint256 quantity, uint256 amountToPayInNative, address collateralToken, address sender, address indexed to);

    struct Product {
        uint256 productId;
        uint256 quantity;
        uint256 price; // price enter in terms of usdc/usdt in 8 decimals
        bool onSale;
    }

    struct Item {
        uint256 tokenId;
        uint256 productId;
        address owner;
        uint256 price; // price is stored as native erc20 values(collateral)
        address collateral;
    }

    uint256 private constant ROYALTY_FEE = 3000;
    address private immutable royaltyReceiver;
    IMarketItems private immutable i_marketItems;
    IFactory private immutable i_factory;

    uint256 private productIdTracker; // product id starts from - 1

    mapping(address collateralToken => bool acceptByMarket) private collateralTokens;
    mapping(uint256 productId => mapping(address collateralToken => bool)) private acceptedTokens;
    mapping(uint256 productId => Product) private productData;
    mapping(uint256 tokenId => Item) private itemData;
    mapping(address owner => uint256[] tokenIds) private ownerTokens;
    mapping(address user => bool) private blackList;

    Product[] private allProducts;

    constructor(address _marketItems, address _owner, address _royaltyReceiver, address[] memory _collateralTokens)
        Ownable(_owner)
    {
        i_marketItems = IMarketItems(_marketItems);
        i_factory = IFactory(_royaltyReceiver);
        royaltyReceiver = _royaltyReceiver;

        for (uint256 i = 0; i < _collateralTokens.length; i++) {
            collateralTokens[_collateralTokens[i]] = true;
        }
    }

    function buyProduct(uint256 _productId, address _collateralToken, uint256 _quantity, address _to, string memory _tokenURI, bytes memory _data)
        external
        nonReentrant
        whenNotPaused
    {
        require(!blackList[msg.sender] && !blackList[_to], "MarketPlace : Black list not allowed");
        require(_productId <= productIdTracker, "MarketPlace : Invalid productId");
        require(
            acceptedTokens[_productId][_collateralToken] && collateralTokens[_collateralToken],
            "MarketPlace : Unacceptable collateral token"
        );
        require(_quantity > 0, "MarketPlace : Quantity should be greater than 1");

        Product memory m_product = productData[_productId];
        require(m_product.onSale, "MarketPlace : Product is not on sales");
        require(m_product.quantity >= _quantity, "MarketPlace : Insufficent quantity");

        address pricefeed = i_factory.getPriceFeed(_collateralToken);
        uint256 tokenPriceInUSD = uint256(AggregatorV3Interface(pricefeed).latestAnswer()); // 8-decimals

        uint256 nativeTokenDecimals = IERC20Metadata(_collateralToken).decimals();

        uint256 amountToPayInUSD = _quantity * m_product.price; // 6-decimals
        uint256 amountToPayInNative = (amountToPayInUSD * 10 ** nativeTokenDecimals) / tokenPriceInUSD; // to do

        uint256 fee = (amountToPayInNative * ROYALTY_FEE) / 10 ** 6;

        _safeTransferFromERC20(_collateralToken, msg.sender, address(this), amountToPayInNative - fee);
        _safeTransferFromERC20(_collateralToken, msg.sender, address(i_factory), fee);

        uint tokenId;

        if(_data.length > 0) {
            tokenId = i_marketItems.safeMint(_to, _tokenURI, _data);
        } else {
            tokenId = i_marketItems.mint(_to, _tokenURI);
        }

        // descreasing the quantity
        productData[_productId].quantity -= _quantity;

        Item memory item = Item(tokenId, _productId, _to, amountToPayInNative, _collateralToken);
        itemData[tokenId] = item;

        ownerTokens[_to].push(tokenId);

        emit MarketItemBought(tokenId, _productId, _quantity, amountToPayInNative, _collateralToken, msg.sender, _to);
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

    function createSingleProducts(
        uint256 _quantity,
        uint256 _priceInUSD, // takes in terms of 6 - decimals
        bool _onSale,
        address[] memory _collateralTokens
    ) external onlyOwner {
        // entering of unique name is verified at database
        require(_collateralTokens.length > 0, "MarketPlace : Product has to accept atleast 1 collateral to buy");
        require(
            _collateralTokens.length > 0 && _checkCollaterals(_collateralTokens),
            "MarketPlace : Invalid collateral token"
        );

        uint256 productId = ++productIdTracker;
        _createProduct(productId, _quantity, _priceInUSD, _onSale, _collateralTokens);
    }

    function createMultipleProducts(
        uint256[] memory _quantity,
        uint256[] memory _priceInUSD,
        bool[] memory _onSale,
        address[] memory _collateralTokens
    ) external onlyOwner {
        require(
            _quantity.length == _priceInUSD.length && _priceInUSD.length == _onSale.length && _onSale.length > 0,
            "MarketPlace : Invalid length of elements"
        );
        require(_collateralTokens.length > 0, "MarketPlace : Product has to accept atleast 1 collateral to buy");
        require(_checkCollaterals(_collateralTokens), "MarketPlace : Invalid collateral token");

        for (uint256 i = 0; i < _quantity.length; i++) {
            uint256 productId = ++productIdTracker;
            _createProduct(productId, _quantity[i], _priceInUSD[i], _onSale[i], _collateralTokens);
        }
    }

    function _createProduct(
        uint256 _productId,
        uint256 _quantity,
        uint256 _priceInUSD,
        bool _onSale,
        address[] memory _collateralTokens
    ) private {
        Product memory product = Product(_productId, _quantity, _priceInUSD, _onSale);

        for (uint256 i = 0; i < _collateralTokens.length; i++) {
            acceptedTokens[_productId][_collateralTokens[i]] = true;
        }

        productData[_productId] = product;
        allProducts.push(product);

        emit ProductCreated(_productId, _quantity, _priceInUSD, _collateralTokens);
    }

    function _checkCollaterals(address[] memory _tokens) private view returns (bool) {
        for (uint256 i = 0; i < _tokens.length; i++) {
            if (!collateralTokens[_tokens[i]]) {
                return false;
            }
        }
        return true;
    }

    function removeProducts(uint256[] memory _productIds) external onlyOwner {
        uint256 totalProducts = productIdTracker;

        for (uint256 i = 0; i < _productIds.length; i++) {
            require(_productIds[i] <= totalProducts, "MarketPlace : Inavlid product id");
            delete productData[_productIds[i]];

            emit RemoveProduct(_productIds[i]);
        }
    }

    function changeProductQuantity(uint256[] memory _productIds, uint256[] memory _quantities) external onlyOwner {
        require(
            _productIds.length == _quantities.length && _productIds.length > 0, "MarketPlace : Invalid array elements"
        );

        for (uint256 i = 0; i < _productIds.length; i++) {
            productData[_productIds[i]].quantity = _quantities[i];
        }
    }

    function changeProductSale(uint256[] memory _productIds, bool[] memory _sales) external onlyOwner {
        require(_productIds.length == _sales.length && _productIds.length > 0, "MarketPlace : Invalid array elements");

        for (uint256 i = 0; i < _productIds.length; i++) {
            productData[_productIds[i]].onSale = _sales[i];
        }
    }

    function changeProductPrice(uint256[] memory _productIds, uint256[] memory _prices) external onlyOwner {
        require(_productIds.length == _prices.length && _productIds.length > 0, "MarketPlace : Invalid array elements");

        for (uint256 i = 0; i < _productIds.length; i++) {
            productData[_productIds[i]].price = _prices[i];
        }
    }

    function addProductCollateral(uint256[] memory _productIds, address[] memory _collateralTokens)
        external
        onlyOwner
    {
        require(
            _productIds.length == _collateralTokens.length && _collateralTokens.length > 0,
            "MarketPlace : Invalid length of elements"
        );

        uint256 totalProducts = productIdTracker;
        for (uint256 i = 0; i < _collateralTokens.length; i++) {
            require(_productIds[i] <= totalProducts, "MarketPlace : Invalid product id");
            require(i_factory.isAcceptableCollateral(_collateralTokens[i]), "MarketPlace : Invalid collateral token");
            acceptedTokens[_productIds[i]][_collateralTokens[i]] = true;
        }
    }

    function removeProductCollateral(uint256[] memory _productIds, address[] memory _collateralTokens)
        external
        onlyOwner
    {
        require(
            _productIds.length == _collateralTokens.length && _collateralTokens.length > 0,
            "MarketPlace : Invalid length of elements"
        );

        uint256 totalProducts = productIdTracker;
        for (uint256 i = 0; i < _collateralTokens.length; i++) {
            require(_productIds[i] <= totalProducts, "MarketPlace : Invalid product id");
            acceptedTokens[_productIds[i]][_collateralTokens[i]] = false;
        }
    }

    function transferOwnership(uint256 _marketId, address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "MarketPlace : Invalid zero address");
        super.transferOwnership(address(i_factory));
        i_factory.transferMarketPlaceOwner(_marketId, address(this), _newOwner, msg.sender);
    }

    function renounceOwnership() public override onlyOwner {
        require(false, "MarketPlace : Market cannot handle without owner");
    }

    function addCollateralToken(address _tokenAddress) external onlyOwner {
        require(i_factory.isAcceptableCollateral(_tokenAddress), "MarketPlace : Invalid collateral token");
        collateralTokens[_tokenAddress] = true;
    }

    function removeCollateralToken(address _tokenAddress) external onlyOwner {
        delete collateralTokens[_tokenAddress];
    }

    function pauseFunctions() external onlyOwner {
        _pause();
    }

    function unpauseFunctions() external onlyOwner {
        _unpause();
    }
}
