// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MarketItems is ERC721URIStorage, Ownable, ReentrancyGuard {
    event Mint(uint256 indexed tokenId, address indexed to, string tokenURI, bytes callData);

    uint256 private tokenId;
    // tokenId starts from 1, use tokenId - 0 for other uses.

    constructor(string memory _name, string memory _symbol, address _owner) ERC721(_name, _symbol) Ownable(_owner) {}

    function mint(address _to, string memory _tokenURI) external nonReentrant onlyOwner returns (uint256) {
        uint256 _tokenId = ++tokenId;
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        emit Mint(_tokenId, _to, _tokenURI, "");
        return _tokenId;
    }

    function safeMint(address _to, string memory _tokenURI, bytes memory _data) external nonReentrant onlyOwner returns (uint256) {
        uint256 _tokenId = ++tokenId;
        _safeMint(_to, _tokenId, _data);
        _setTokenURI(_tokenId, _tokenURI);
        emit Mint(_tokenId, _to, _tokenURI, _data);
        return _tokenId;
    }

    function approve(address , uint256 ) public override(ERC721, IERC721) {
        require(false, "MarketItems : Tokens are not transferable");
    }

    function setApprovalForAll(address , bool ) public override(ERC721, IERC721) {
        require(false, "MarketItems : Tokens are not transferable");
    }

}
