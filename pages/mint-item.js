import {ethers} from 'ethers'
import { useState } from 'react'
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient} from 'ipfs-http-client'
import { nftaddress, nftmarketaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'
import { useRouter } from 'next/router'
import { TransactionDescription } from 'ethers/lib/utils'
import Image from 'next/image'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function MintItem(){
    // setup ipfs
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({price:'', name:'', description:''})
    const router = useRouter() 

    async function onChange(e){
        const file = e.target.files[0]
        try {
            const added = await client.add(file, {
                progress: (prog) => console.log(`received: ${prog}`)
            })
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
            console.log(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
        
    }

    async function createMarket(){
        const {name, description, price} = formInput
        if (!name || !description || !price || ! fileUrl) return 
        const data = JSON.stringify({
            name, description, image: fileUrl
        })

        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            createSale(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createSale(url){
        console.log('create sale')
        const web3Modal = new Web3Modal()
        const conn = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(conn)
        const signer = provider.getSigner()

        // create token
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.mintToken(url)
        let tx = await transaction.wait()
        console.log(tx)
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        // list for sale
        contract = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()
        transaction = await contract.makeMarketItem(nftaddress, tokenId, price, {value: listingPrice})
        await transaction.wait()
        router.push('/')
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input 
                placeholder='Name'
                className='mt-8 border rounded p-4'
                onChange={e=>updateFormInput({...formInput, name:e.target.value})}
                />
                <textarea 
                placeholder='Description'
                className='mt-2 border rounded p-4'
                onChange={e=>updateFormInput({...formInput, description:e.target.value})}
                />
                <input 
                placeholder='Price'
                className='mt-2 border rounded p-4'
                onChange={e=>updateFormInput({...formInput, price:e.target.value})}
                />
                <input 
                type='file'
                name='Asset'
                className='mt-4'
                onChange={onChange}
                />
                {console.log(fileUrl)}
                {
                    
                    fileUrl && (<Image src={fileUrl} className='mt-4 rounded' width='350' height='350' alt=''/>)
                }
                <button onClick={createMarket} className='font-bold mt-4 bg-sky-700 text-white rounded p-4 shadow-lg'>Mint</button>
            </div>
        </div>
    )
}