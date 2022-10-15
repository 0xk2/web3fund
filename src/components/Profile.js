import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { Button } from '@mui/material';
import { shortenAddress } from '../Utils';

function Profile() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  if (isConnected)
    return (
      <Button variant="outlined" onClick={disconnect}>
        {shortenAddress(address)}
      </Button>
    )
  return (
    <Button variant="contained" onClick={connect}>
      Connect Wallet
    </Button>
  )
}

export default Profile;