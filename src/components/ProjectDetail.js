import { Typography, Box, Button, Paper, Chip, Snackbar, Alert, Tabs, Tab, TextField, CircularProgress, Backdrop, OutlinedInput, InputAdornment } from "@mui/material";
import { NotionRenderer } from 'react-notion';
import { readableBigNumber, formatLargeNumber, redeemable, formatDisperseText } from '../Utils';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useUIHelper } from "../context/UIHelperContext";
import { useNavigate } from "react-router-dom";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import {useState} from 'react';

function ProjectDetail({
    name, avatarBase64, symbol, totalSupply, aboutContent, shareTokenDecimal, creationTxn, 
    asset, totalAsset, assetTokenDecimal, assetSymbol, 
    myAsset, myShare, 
    deposit, toDeposit, setToDeposit, 
    redeem, toRedeem, setToRedeem,
    burn, toBurn, setToBurn, 
    allowDisperse, disperseAllowance, 
    disperse, toDisperse, setToDisperse,
    isLoading, setLoading
  }) {
  const defaultAvatar = 'https://robohash.org/6IP.png?set=set1&size=150x150';
  const { setInfoMessage } = useUIHelper();
  const navigate = useNavigate();
  totalAsset = !totalAsset?BigNumber.from(0):totalAsset;
  const [selectedTab, setSelectedTab] = useState(0);

  myShare = myShare??BigNumber.from(0);
  totalSupply = totalSupply??BigNumber.from(0);
  shareTokenDecimal = shareTokenDecimal??BigNumber.from(0);
  
  const toReceive = redeemable({
    shareToRedeem: toRedeem, shareTokenDecimal, totalSupply, assetTokenDecimal, totalAsset
  });
  // const _depositAmount = assetTokenDecimal && toDeposit && !isNaN(toDeposit) ? ((BigNumber.from(10).pow(assetTokenDecimal.toNumber())).mul(toDeposit)).toString() : "0";
  
  const [isPreviewDisperse, setPreviewDisperse] = useState(false);
  const _maxToRedeem = parseFloat(formatUnits(myShare, shareTokenDecimal.toNumber()));
  const _formatedDisperse = formatDisperseText(toDisperse, shareTokenDecimal, _maxToRedeem);
  const _pct = totalSupply.toString() === '0' || !totalSupply? 0:
  formatLargeNumber(
    parseFloat(myShare.div(BigNumber.from(10).pow(shareTokenDecimal.toNumber())).toString()) / 
    parseFloat(totalSupply.div(BigNumber.from(10).pow(shareTokenDecimal.toNumber())).toString())
    *100
  )
  return (
    <>
      <Backdrop key={isLoading??false} className="backdrop" open={isLoading??false}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar open={creationTxn !== undefined} autoHideDuration={6000} anchorOrigin={{ vertical:'top', horizontal:'center'}}>
        <Alert severity="success">SmartContract successfully created!</Alert>
      </Snackbar>
      <img src={avatarBase64? avatarBase64: defaultAvatar} className="avatar-display"  alt={name} />
      <Typography variant="h2" className="heading">
        {name} {creationTxn ? <Button variant="contained" onClick={() => {
          navigate('/'+creationTxn.logs[0].address);
        }}>View Project</Button>: null}
      </Typography>
      <hr/>
      <Paper elevation={3} sx={{marginTop: "32px", marginBottom: "32px", padding: "32px"}}>
        <Box>
          There are total &nbsp; 
          <Chip 
            color="primary" variant="primary" size="medium" label={totalSupply ? readableBigNumber(BigNumber.from(totalSupply), BigNumber.from(18))+" "+symbol:""}
          /> represent 100% ownership of &nbsp; 
          <Chip 
            color="primary" variant="primary" size="medium" label={readableBigNumber(BigNumber.from(totalAsset), assetTokenDecimal)+' '+assetSymbol}
            icon={<ContentCopyIcon sx={{fontSize: "16px", cursor: "pointer"}} />}
            onClick={() => {
              navigator.clipboard.writeText(asset);
              setInfoMessage(asset+' copied to clipboard');
            }}
            clickable
          />
        </Box>
      </Paper>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => {
          setSelectedTab(newValue)
        }} aria-label="basic tabs example">
          <Tab label="Home"></Tab>
          <Tab label="Redeem"></Tab>
          <Tab label="Operation"></Tab>
        </Tabs>
      </Box>
      { selectedTab === 0 ?
      <>
        <Paper elevation={3} sx={{marginTop: "32px", marginBottom: "32px", padding: "32px"}}>
          <NotionRenderer blockMap={aboutContent} fullPage={false} darkMode={false} />
        </Paper>
      </>
      : null }
      { selectedTab === 1 ?
      <Paper elevation={3} sx={{marginTop: "32px", marginBottom: "32px", padding: "32px"}}>
        <Box className="ipt">
          <Box className="lbl">Your funding share</Box>
          <Box className="val">{readableBigNumber(myShare, shareTokenDecimal)} {symbol} - {_pct}% of the Total Asset</Box>
        </Box>
        <Box className="ipt">
          <Box className="lbl">Redeem</Box>
          <Box className="val">
            <OutlinedInput value={toRedeem} onChange={(e) => {
              if(_maxToRedeem >= parseFloat(e.target.value)) {
                setToRedeem(!isNaN(e.target.value) && e.target.value !== '' ? e.target.value: 0);
              }
            }} size="small" disabled={redeem?false:true} endAdornment={<InputAdornment position="end">
              <Button variant="text" onClick={() => {
                setToRedeem(_maxToRedeem);
              }}>MAX</Button>
            </InputAdornment>} /> {symbol} to get {toReceive} {assetSymbol}
          </Box>
          <Button variant="contained" disabled={redeem?false:true} onClick={() => {
            redeem.write();
            setLoading(true);
          }}>Redeem</Button>
        </Box>
      </Paper>
      : null }
      { selectedTab === 2 ?
      <Paper elevation={3} sx={{marginTop: "32px", marginBottom: "32px", padding: "32px"}}>
        <Box className="ipt">
          <Box className="lbl">Your asset balance</Box>
          <Box className="val">{readableBigNumber(myAsset, assetTokenDecimal)??0} {assetSymbol}</Box>
        </Box>
        <Box className="ipt">
          <Box className="lbl">Deposit to the fund</Box>
          <Box className="val">
            <Box>
              <TextField value={toDeposit} onChange={(e) => {
                setToDeposit(!isNaN(e.target.value) ? e.target.value: 0);
              }} size="small" disabled={setToDeposit?false:true} /> {assetSymbol} &nbsp;
              <Button sx={{marginLeft:"16px"}} variant="contained" onClick={() => {
                deposit.write();
                setLoading(true);
              }} disabled={deposit?false:true}>Deposit</Button>
            </Box>
            {/* <Box className="subtitle" sx={{marginTop: "16px"}}>
              {_depositAmount}
            </Box> */}
          </Box>
        </Box>
        <Box className="ipt">
          <Box className="lbl">Burn your share</Box>
          <Box className="val">
            <OutlinedInput value={toBurn} onChange={(e) => {
              if(_maxToRedeem >= parseFloat(e.target.value)) {
                setToBurn(!isNaN(e.target.value) && e.target.value !== '' ? e.target.value: 0);
              }
            }} size="small" disabled={burn?false:true} endAdornment={<InputAdornment position="end">
              <Button variant="text" onClick={() => {
                setToBurn(_maxToRedeem);
              }}>MAX</Button>
            </InputAdornment>} /> {symbol} &nbsp;
            <Button variant="contained" disabled={burn?false:true} onClick={() => {
              burn.write();
              setLoading(true);
            }}>Burn</Button>
          </Box>
        </Box>
        <Box className="ipt">
          <Box className="lbl">Disperse your share</Box>
          <Box className="val">
            {!isPreviewDisperse?
            <>
              <TextField multiline={true} value={toDisperse} onChange={(e) => {
                setToDisperse(e.target.value);
              }} size="small" 
                fullWidth minRows={3}
                placeholder={"0x4f0b01d9D91CbacaD9A4521d1aF79B2C96053D21,100\n0x4f0b01d9D91CbacaD9A4521d1aF79B2C96053D21 100\n0x4f0b01d9D91CbacaD9A4521d1aF79B2C96053D21=100" }
                disabled={disperse?false:true} sx={{marginBottom: '16px', whiteSpace: "pre-line", wordWrap:"break-word"}} />
              <Button variant="contained" disabled={disperse?false:true} onClick={() => {
                setPreviewDisperse(true);
              }}>Preview</Button>
            </>
            :
            <>
            <Box sx={{marginBottom: '16px', padding: '16px 32px', border: "1px solid #ddd", fontStyle: "oblique"}}>
              {_formatedDisperse?.display?.map((dupl,i) => {
                return (
                  <Box key={i}>
                    <Box sx={{display: "inline", marginRight: "16px"}}>{dupl?.address}</Box>
                    <Box sx={{display: "inline"}}>{dupl?.value}</Box>
                  </Box>
                )
              })}
              <Box>
                <Box sx={{display: "inline", marginRight: "16px"}}>Total</Box>
                <Box sx={{display: "inline"}}>{_formatedDisperse?.total}</Box>
              </Box>
            </Box>
            <Box>
              <Button variant="outlined" sx={{marginRight: "16px"}} disabled={disperse?false:true} onClick={() => {
                setPreviewDisperse(false);
              }}>Edit</Button>
              {disperseAllowance?.lt(BigNumber.from(_formatedDisperse.total??0))?
                <Button variant="contained" disabled={disperse?false:true} onClick={() => {
                  allowDisperse.write();
                  setLoading(true);
                }}>Allow Disperse to send your fund</Button>
              :
                <Button variant="contained" disabled={disperse?false:true} onClick={() => {
                  setPreviewDisperse(false);
                  disperse.write();
                  setLoading(true);
                }}>Disperse</Button>
              }
              
            </Box>
            </>
            }
            
          </Box>
        </Box>
      </Paper>
      : null }
    </>
  )
}

export default ProjectDetail;