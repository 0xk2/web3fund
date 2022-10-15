import { Box, Button, CircularProgress, Snackbar, Alert, Backdrop } from '@mui/material';
import * as React from 'react';
import {useState} from 'react';
import { useUIHelper } from '../context/UIHelperContext';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction, useContractReads } from 'wagmi'
import FactoryUI from '../components/FactoryUI';
import ProjectDetail from '../components/ProjectDetail';
import { FactoryContractAddress, FactoryAbi, AssetTokenAbi } from '../config';
import { useNavigate } from "react-router-dom";
import { uploadToPinata, readableBigNumber, loadNotionContent } from '../Utils';
import axios from 'axios';
import { Container } from '@mui/system';
import { BigNumber } from 'ethers';

function Factory() {
  const [name, setName] = useState('Publish "1984" book');
  const [symbol, setSymbol] = useState('P1984');
  const [totalSupply, setTotalSupply] = useState(10000);
  
  const [avatar, setAvatar] = useState(''); // ifps to save on blockchain
  const [avatarImgFile, setAvatarImgFile] = useState(''); // file to upload
  const [avatarBase64, setAvatarBase64] = useState(''); // base64 to show on image

  const [about, setAbout] = useState('31604112e7f14367b2e2eb51d498183b'); // notion id to save on blockchain
  const [aboutContent, setAboutContent] = useState(false); // json content to display
  
  const [asset, setAsset] = useState('0xAF9cF7885084741Fa80ae71439617fe3abaDF165'); // erc20 address
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetBalance, setAssetBalance] = React.useState('');
  
  const {setErrorMessage, setSuccessMessage, setInfoMessage, setBackdropState} = useUIHelper();
  const { address, isConnected } = useAccount()
  
  const [preview, setPreview] = useState(false);
  
  const readAsset = useContractReads({
    contracts: [
      {
        addressOrName: asset,
        contractInterface: AssetTokenAbi,
        functionName: 'symbol',
      },
      {
        addressOrName: asset,
        contractInterface: AssetTokenAbi,
        functionName: 'decimals'
      },
      {
        addressOrName: asset,
        contractInterface: AssetTokenAbi,
        functionName: 'balanceOf',
        args: [address]
      }
    ],
    onSuccess: function(data){
      setAssetSymbol(data[0]);
      setAssetBalance(readableBigNumber(data[2], data[1]));
    }
  })
  React.useEffect(() => {
    const fn = async () => {
      try{
        const data = await loadNotionContent(axios, about);
        if(!data){
          setErrorMessage('Cannot load Notion page.');
        }else{
          setAboutContent(data);
        }
      }catch(error){
        setErrorMessage('Cannot load Notion page.');
      }
    }
    fn();
  },[about, setErrorMessage]);
  
  const _totalSupply = totalSupply+"000000000000000000"; // for creating smart contract with 18 decimal
  const { config } = usePrepareContractWrite({
    addressOrName: FactoryContractAddress,
    contractInterface: FactoryAbi,
    functionName: 'create',
    args:[asset, name, symbol, _totalSupply, about, avatar]
  })
  const ucw = useContractWrite({...config, onSuccess(data){
    setFctxn(data.hash);
  }});
  const fnCreate = ucw.writeAsync;
  const [fctxn, setFctxn] = useState('')
  const fctxnObj = useWaitForTransaction({
    hash: fctxn
  });
  const navigate = useNavigate();

  const previewProps = {
    name, avatarBase64, symbol, totalSupply:BigNumber.from(_totalSupply), asset, 
    aboutContent, assetSymbol, creationTxn: fctxnObj.data
  };
  const editProps = {
    name, setName, 
    symbol, setSymbol, 
    totalSupply, setTotalSupply, 
    about, setAbout, aboutContent, setAboutContent,
    avatarBase64, setAvatarBase64, setAvatarImgFile,
    asset, setAsset, 
    assetSymbol,
    assetBalance
  };
  
  return (
    <Container maxWidth="xl" className="page">
      {
        readAsset.isLoading === true?
          <>
            <CircularProgress size={16} /> <span>Initializing on-chain data ...</span>
          </>
          :
          <>
            {preview === true? 
              <>
                <ProjectDetail {...previewProps}/>
                {isConnected === true? 
                  <Box className="control-panel">
                    {
                      fctxnObj.data !== undefined ? 
                      <>
                        <Button variant="contained" onClick={()=>{navigate('/'+fctxnObj.data.logs[0].address)}}>View Project</Button>
                      </>
                      :
                      <>
                        <Button variant="contained" onClick={async () => {
                          fnCreate();
                        }}>
                          Create {symbol} token
                        </Button>
                        <Button onClick={async () => {
                          setPreview(false);
                        }}>Back to Edit</Button>
                      </>
                    }    
                    
                  </Box>
                : null}
              </>
              :
              <>
                <FactoryUI {...editProps} />
                {isConnected === true?
                  <Box className="control-panel">
                    <Button variant="contained" onClick={async () => {
                      if(!avatarImgFile){
                        setErrorMessage('You must upload an image!');
                        return;
                      }
                      setInfoMessage('Uploading image');
                      setBackdropState(true);
                      let _avatar;
                      try{
                        _avatar = await uploadToPinata(axios, avatarImgFile);
                      }catch(error){
                        setErrorMessage('Cannot connect to IPFS service.');
                        setBackdropState(false);
                      }
                      if(_avatar){
                        setAvatar(_avatar);
                        setSuccessMessage('Image uploaded.');
                        setPreview(true);
                      }else{
                        setErrorMessage('Image upload failed.');
                      }
                      setBackdropState(false);
                    }}>Preview</Button>
                  </Box> 
                : null}
              </>
            }
          </>
        }
      {
        <Backdrop key={fctxnObj.status} className="backdrop" open={fctxnObj.status === 'loading' ? true : false}>
          {ucw.isLoading === true?
            <Snackbar open={ucw.isLoading === true} autoHideDuration={6000} anchorOrigin={{ vertical:'top', horizontal:'center'}}>
              <Alert severity='info'>Creating Smart Contract ...</Alert>
            </Snackbar>
          :null}
          {fctxnObj.isLoading === true?
            <Snackbar open={ucw.isLoading === true} autoHideDuration={6000} anchorOrigin={{ vertical:'top', horizontal:'center'}}>
              <Alert severity='info'>Loading Contract Detail ...</Alert>
            </Snackbar>
          :null}
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </Container>
  )
}

export default Factory;