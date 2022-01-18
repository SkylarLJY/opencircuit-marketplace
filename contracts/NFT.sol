//SPDX-License-Isnetifier: MIT
pragma solidity  ^0.8.4;

// openzeppeling ERC721
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';


contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddr;

    constructor (address marketplaceAddr) ERC721('KryptoBirdz', 'KBIRDS'){
        contractAddr = marketplaceAddr;
    }

    function mintToken(string memory tokenURI) public returns(uint){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        // give marketplace approval for transaction
        setApprovalForAll(contractAddr, true);
        return newItemId;
    }
}