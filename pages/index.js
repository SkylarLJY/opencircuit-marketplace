import {ethers} from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Image from 'next/image'

import { nftaddress, nftmarketaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'

export default function Home() {
  const [nfts, setNFTs] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  
  useEffect(()=>{
    loadNFTs()
  }, [])

  async function loadNFTs(){
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, KBMarket.abi, provider)
    console.log(marketContract)
    const data = await marketContract.fetchMarketToken()

    const items = await Promise.all(data.map(async i=>{
      // console.log(i)
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      console.log(tokenUri)
      // try {
      //   const meta = await axios.get(tokenUri)
      // } catch (error) {
      //   console.log(error)
      //   return 
      // }

      const meta = await axios.get(tokenUri) 
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price: price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }))
    setNFTs(items)
    setLoadingState('loaded')
  }

  async function buyNFT(nft){
    const web3Modal = new Web3Modal()
    const conn = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(conn)
    const singer = provider.getSigner()
    const contract = new ethers.Contract(nftMarketAddress, KBMarket.abi, singer)
    
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {value: price})

    await transaction.wait()
    loadNFTs()
  }

  if (loadingState == 'loaded' && !nfts.length)
    return (<h1 className='px-20 py-7 text-4x1'>No NFT in marketplace</h1>)
  
  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{maxWidth: '160px'}}></div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
        {
          nfts.map((nft, i)=>(
            <div key={i} className='border shadow rounded-xi overflow-hidden'>
              <Image src={nft.image} alt=''/>
              <div className='p-4'>
                <p className='text-3xl font-semibold' style={{height:'64px'}}>{nft.name}</p>
                <div style={{height:'72px', overflow: 'hidden'}}>
                  <p className='text-gray-400'>{nft.description}</p>
                </div>
              </div>
              <div className='p-4 bg-black'>
                <p className='text-3x-1 mb-4 font-bold text-white'>{nft.price} ETH</p>
                <button className='w-full bg-sky-700 text-white font-bold py-3' onClick={()=> buyNFT(nft)}>Buy</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
