//SPDX-License-Isnetifier: MIT
pragma solidity  ^0.8.4;

// openzeppeling ERC721
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import 'hardhat/console.sol';

contract KBMarket is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _tokensSold;

    address payable owner;

    // matic is in cents
    uint256 listingPrice = 0.045 ether;

    constructor(){
        owner = payable(msg.sender);
    }

    struct MarketToken{
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketToken) private idToMarketToken;

    event MarketTokenMinted (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns(uint256) {
        return listingPrice;
    }

    function makeMarketItem (address nftContract, uint tokenId, uint price)
    public payable nonReentrant {
        require(price>0, 'Price must be greater than 0');
        require(msg.value==listingPrice, 'Price must be equal to listing price');

        _tokenIds.increment();
        uint itemId = _tokenIds.current();

        idToMarketToken[itemId] = MarketToken({
            itemId: itemId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: payable (msg.sender),
            owner: payable(address(0)),
            price: price,
            sold: false
        });

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        emit MarketTokenMinted(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );    
    }

    // conduct transaction for market sales
    function createMarketSale(address nftContract, uint itemId) public payable nonReentrant {
        uint price = idToMarketToken[itemId].price;
        uint tokenId = idToMarketToken[itemId].tokenId;
        require(msg.value==price, 'Submitted value should equal to the listed price');
        idToMarketToken[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        // IERC721(nftContract).transferFrom(idToMarketToken[itemId].seller, msg.sender, tokenId);
        idToMarketToken[itemId].sold = true;
        idToMarketToken[itemId].owner = payable(msg.sender);
        _tokensSold.increment();
    }

    // to fetch market items for minting, buying and selling
    function fetchMarketToken() public view returns(MarketToken[] memory){
        uint itemCount = _tokenIds.current();
        uint unsoldItemCount = _tokenIds.current() - _tokensSold.current();
        uint currentIndex = 0;

        MarketToken[] memory items = new MarketToken[](unsoldItemCount);
        for (uint i=1; i<=itemCount; i++){
            if (idToMarketToken[i].owner == address(0)){ // if it's an unsold item
                items[currentIndex] = idToMarketToken[i];
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMyNFTs() public view returns(MarketToken[] memory){
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i=1; i<=totalItemCount; i++){
            if (idToMarketToken[i].owner == msg.sender){
                itemCount += 1;
            }
        }

        MarketToken[] memory items = new MarketToken[](itemCount);
        for (uint i=1; i<=totalItemCount; i++){
            if (idToMarketToken[i].owner == msg.sender){
                items[currentIndex] = idToMarketToken[i];
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchItemsCreated() public view returns (MarketToken[] memory){
        uint itemCount = 0;
        uint totalItemCount = _tokenIds.current();
        uint currentIndex = 0;

        for (uint i = 1; i <= totalItemCount; i++){
            if (idToMarketToken[i].seller == msg.sender){
                itemCount += 1;
            }
        }

        MarketToken[] memory items = new MarketToken[](itemCount);
        for (uint i = 1; i <= totalItemCount; i++){
            if (idToMarketToken[i].seller == msg.sender){
                items[currentIndex] = idToMarketToken[i];
                currentIndex += 1;
            }
        }
        return items;
    }

}

