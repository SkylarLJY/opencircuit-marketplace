import '../styles/globals.css'
import './app.css'
import Link from 'next/link'

function KryptoBirdMarketplace({Component, pageProps}){
  return (
    <div>
      <nav className='border-b p6' style={{backgroundColor: '#7393A7'}}>
        <p className='text-4xl font-bold text-white'>Marketplace</p>
        <div className='flex mt-4 justify-center'>
          <Link href='/'>
            <a className='mr-6'>Main Marketplace</a>
          </Link>
          <Link href='/mint-item'>
            <a className='mr-6'>Mint Tokens</a>
          </Link>
          <Link href='/my-nfts'>
            <a className='mr-6'>My NFTs</a>
          </Link>
          <Link href='/account-dashboard'>
            <a className='mr-4'>Account Dashboard</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps}>{pageProps}</Component>
    </div>
  )
}

export default KryptoBirdMarketplace