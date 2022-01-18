const { expect } = require("chai");
const { ethers } = require("hardhat");
const { list } = require("postcss");

describe("KBMarket", function(){
  it("should mint and trade NFTs", async function() {
    // contract address test
    const Market = await ethers.getContractFactory('KBMarket')
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address 

    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    // listing price test
    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()
    // console.log("listingPrice", listingPrice)

    // minting test
    const auctionPrice = ethers.utils.parseUnits('100', 'ether')
    await nft.mintToken('https-t1')
    await nft.mintToken('https-t2')

    console.log(listingPrice)

    await market.makeMarketItem(nftContractAddress, 1, auctionPrice, {value: listingPrice})
    await market.makeMarketItem(nftContractAddress, 2, auctionPrice, {value: listingPrice})
  
    // different accounts
    const [_, buyerAddress] = await ethers.getSigners()
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {value: auctionPrice})
    let items = await market.fetchMarketToken()
    items = await Promise.all(items.map(async i=>{
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items', items)
  })
})
