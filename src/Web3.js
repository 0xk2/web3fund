import { configureChains, chain } from 'wagmi';
import {
  WagmiConfig,
  createClient,
  defaultChains,
} from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

import {shortenAddress} from './Utils';
const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet, chain.polygon],
  [publicProvider()],
)

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
})

function Web3Render() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    onSuccess(data) {
      console.log('connection success');
    }
  })
  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('address: ',address)
    },
  })
  const { disconnect } = useDisconnect()
  return (
    <div>
    {
      isConnected ? 
      <div>
        <div><button onClick={() => {disconnect()}}>Disconnect</button> </div>
        <div>{address}</div>
      </div>
      : <button onClick={() => {connect()}}>Connect</button>
    }
    </div>
    
  )
}

function Web3() {
  return (
    <WagmiConfig client={client}>
      <Web3Render />
    </WagmiConfig>
  )
}

export default Web3;