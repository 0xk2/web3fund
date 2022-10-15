import { Box, Button, InputAdornment, OutlinedInput, Paper } from '@mui/material';
import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import { useAccount, useContractReads, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { AssetTokenAbi } from '../config';
import { useUIHelper } from '../context/UIHelperContext';
import { readableBigNumber } from '../Utils';

// function existed only in Demo version
function Demo(){
  const account = useAccount();
  const [assetTokenAddress, setAssetTokenAddress] = useState('0xAF9cF7885084741Fa80ae71439617fe3abaDF165');
  const [toMint, setToMint] = useState(0);
  const [mintTxnHash, setMintTxnHash] = useState('');
  const [balance, setBalance] = useState(0);
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetTotalSupply, setTotalSupply] = useState('');
  const [assetTokenDecimal, setAssetTokenDecimal] = useState(BigNumber.from(1));
  const assetTokenContract = {
    addressOrName: assetTokenAddress,
    contractInterface: AssetTokenAbi
  }
  const { setBackdropState, setSuccessMessage } = useUIHelper();
  const contractReads = useContractReads({
    contracts: [
      {
        ...assetTokenContract,
        functionName: 'symbol'
      },
      {
        ...assetTokenContract,
        functionName: 'balanceOf',
        args: [account.address]
      },
      {
        ...assetTokenContract,
        functionName: 'decimals',
      },
      {
        ...assetTokenContract,
        functionName: 'totalSupply',
      }
    ],
    onSuccess: function(data){
      setAssetSymbol(data[0]);
      setBalance(readableBigNumber(data[1], data[2]));
      setTotalSupply(readableBigNumber(data[3], data[2]));
      setAssetTokenDecimal(data[2]);
      setBackdropState(false);
    }
  })
  const {config: prepareMint} = usePrepareContractWrite({
    ...assetTokenContract,
    functionName: "mint",
    args: [
      BigNumber.from(toMint).mul(BigNumber.from(10).pow(assetTokenDecimal.toNumber())),
      account.address
    ]
  })
  const mint = useContractWrite({
    ...prepareMint,
    onSuccess: function({hash}){
      setMintTxnHash(hash);
    }
  })
  useWaitForTransaction({
    hash: mintTxnHash,
    onSuccess: function(){
      setSuccessMessage('Minted!');
      setBackdropState(false);
      setToMint(0);
      contractReads.refetch();
    }
  })
  useEffect(() => {
    setBackdropState(true);
  },[setBackdropState]);
  return (
    <Paper sx={{padding: '32px'}} elevation={3}>
      <Box className="ipt">
        <Box className="lbl">Token Address</Box>
        <Box className="val">
          <OutlinedInput sx={{size: "small"}} value={assetTokenAddress} onChange={(e) => {
            setAssetTokenAddress(e.target.value);
          }} fullWidth endAdornment={<InputAdornment position="end">{assetSymbol}</InputAdornment>}/>
        </Box>
      </Box>
      <Box className="ipt">
        <Box className="lbl">Total Supply</Box>
        <Box className="val">
          {assetTotalSupply} &nbsp; {assetSymbol}
        </Box>
      </Box>
      <Box className="ipt">
        <Box className="lbl">Your balance</Box>
        <Box className="val">
          {balance} &nbsp; {assetSymbol}
        </Box>
      </Box>
      <Box className="ipt">
        <Box className="lbl">Mint amount</Box>
        <Box className="val">
          <OutlinedInput sx={{size: "small"}} value={toMint} 
          onChange={(e)=>{
            setToMint(isNaN(e.target.value) || !e.target.value ? 0 : e.target.value);
          }} fullWidth endAdornment={<InputAdornment position="end">
              <Button variant="contained" disabled={mint?false:true} onClick={() => {
                mint.write();
                setBackdropState(true);
              }}>
                Mint
              </Button>
          </InputAdornment>}/> 
        </Box>
      </Box>
    </Paper>
  )
}

export default Demo;