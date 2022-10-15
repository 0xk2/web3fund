import { Box, TextField, Button, Dialog, DialogContent, Paper, OutlinedInput, InputAdornment } from '@mui/material';
import * as React from 'react';

import { useUIHelper } from '../context/UIHelperContext';
import { NotionRenderer } from 'react-notion';
import { readImageFile } from '../Utils';

function FactoryUI({
    name, setName, 
    symbol, setSymbol, 
    totalSupply, setTotalSupply, 
    about, setAbout, aboutContent, setAboutContent,
    avatarBase64, setAvatarBase64, setAvatarImgFile,
    asset, setAsset, 
    assetSymbol,
    assetBalance
  }) {
  const { setErrorMessage } = useUIHelper();
  const [showNotion, setShowNotion] = React.useState(false);
  
  const onFileChange = function(e){
    const file = e.target.files[0]
    readImageFile(file, function(base64){
      setAvatarImgFile(file);
      setAvatarBase64(base64);
    }, function(){
      console.log('error')
      setErrorMessage('File type not supported');
    });
  }
  return (
    <Paper elavation={2} className="paper-layout">
      <Box className="ipt">
        <Box className="lbl">Project Name</Box>
        <Box className="val">
          <TextField placeholder="Project Name" value={name} size="small" fullWidth 
          onChange={(e) => {
            setName(e.target.value);
          }} />
        </Box>
      </Box>
      <Box className="ipt">
        <Box className="lbl">Avatar</Box>
        {avatarBase64 ? <label>
          <img className="avatar" src={avatarBase64} alt="to upload" />
          <input hidden accept="image/*" multiple type="file" onChange={onFileChange} />
        </label>: 
        <Button variant="contained" component="label">
          Choose File
          <input hidden accept="image/*" multiple type="file" onChange={onFileChange} />
        </Button>
        }
      </Box>
      <Box className="ipt">
        <Box className="lbl">Token Symbol</Box>
        <Box className="val">
          <TextField placeholder="Token Symbol" value={symbol} size="small" fullWidth 
          onChange={(e) => {
            setSymbol(e.target.value);
          }} />
        </Box>
      </Box>
      <Box className="ipt">
        <Box className="lbl">Total Supply</Box>
        <Box className="val">
          <OutlinedInput placeholder="Total Supply" value={totalSupply} size="small" fullWidth
          onChange={(e) => {
            setTotalSupply(e.target.value);
          }} endAdornment={<InputAdornment position="end">{symbol}</InputAdornment>} />
        </Box>
      </Box>
      <Box className="ipt">
        <Box className="lbl">
          Asset Address
        </Box>
        <Box className="val">
          <Box sx={{lineHeight: "40px"}}>
            <OutlinedInput placeholder="Asset address" value={asset} size="small" fullWidth 
            onChange={(e) => {
              setAsset(e.target.value);
            }} endAdornment={<InputAdornment position="end">{assetSymbol }</InputAdornment>} /> 
          </Box>
          <p className="subtitle">
            This asset is used to payback {symbol} holders. You are holding &nbsp;
            { assetBalance } {assetSymbol}.
          </p>
        </Box>
      </Box>
      <Box className="ipt">
        <Box className="lbl" sx={{marginBottom: "16px"}}>Notion Page Id</Box>
        <Box className="val">
          <OutlinedInput placeholder="Notion page id" value={about} size="small" fullWidth
          onChange={async (e) => {
            setAbout(e.target.value);
          }} endAdornment={<InputAdornment position="end">
            {aboutContent?<Button onClick={() => {
              setShowNotion(true);
            }}>Show content</Button>:null}
          </InputAdornment>} />
        </Box>
      </Box>
      <Dialog open={showNotion} onClose={() => {
        setShowNotion(false);
      }}>
          <DialogContent>
            <NotionRenderer blockMap={aboutContent} fullPage={false} darkMode={false} />
          </DialogContent>
      </Dialog>
    </Paper>
  )
}

export default FactoryUI;