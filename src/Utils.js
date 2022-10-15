export const shortenAddress = function(str) {
  if (str.length < 10) return str;
  return str.slice(2, 6)+"..."+str.slice(str.length - 4);
}

const ApproximateZero = '≈0';
export const formatLargeNumber = function(value, fractionDigits = 2){
  if (value === 0) return '0';
  if (value < 0) {
    const formatted = formatLargeNumber(-value, fractionDigits);
    return formatted === ApproximateZero ? formatted : '-' + formatted;
  }
  for (let i = 2; i <= Math.max(8, fractionDigits); i++) {
    if (value >= 10 ** -i) {
      return value.toLocaleString(undefined, {minimumFractionDigits: i, maximumFractionDigits: i})
    }
  }
  return ApproximateZero;
};

// { data:data, tag:{tags: [{name: "Content-Type", value: "text/plain"}]} }
// export const writeToArweave = async function(arr) {
//   const { WebBundlr } = require('@bundlr-network/client');
//   const { providers } = require('ethers');

//   await window.ethereum.enable()
//   const provider = new providers.Web3Provider(window.ethereum);
//   await provider._ready()
//   const bundlr = new WebBundlr("https://node1.bundlr.network", "bnb", provider);  
//   await bundlr.ready();

//   const balance = await bundlr.getLoadedBalance();
//   let price = await bundlr.getPrice(0)
//   for(var i=0;i<arr.length;i++){
//     const len = arr[i].data.length;
//     const price_i = await bundlr.getPrice(len);
//     price = price.plus(price_i);
//   }
//   const mutiplier = 1.1;
//   if (balance.isLessThan(price.multipliedBy(mutiplier))) {
//     let newBalance = price.multipliedBy(mutiplier);
//     let fundingAmount = newBalance.minus(balance);
//     await bundlr.fund(fundingAmount.integerValue());
//   }
//   let result = [];
//   try{
//     for(var i=0;i<arr.length;i++){
//       const tx = bundlr.createTransaction(arr[i].data, arr[i].tag);
//       await tx.sign();
//       const result_i = await tx.upload();
//       result.push(result_i);
//     }
//     return result;
//   }catch(error){
//     console.error(error);
//     return false;
//   }
// }

export const uploadToImgUr = async function(axios, img){
  var bodyFormData = new FormData();
  bodyFormData.append('image', img)
  const imgur = `${process.env.REACT_APP_IMGUR}`
  return await axios({
    url: 'https://api.imgur.com/3/image',
    method: 'post',
    headers: {
      'Authorization':'Client-ID '+imgur
    },
    data: bodyFormData
  });
}

export const uploadToPinata = async function(axios, img){
  var bodyFormData = new FormData();
  bodyFormData.append('file', img);
  const resp = await axios({
    method: "post",
    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data: bodyFormData,
    headers: {
      'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
      'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
      "Content-Type": "multipart/form-data"
    },
  });
  return resp.data.IpfsHash;
}

export const loadPintaImage = function(hash) {
  return "https://gateway.pinata.cloud/ipfs/"+hash;
}

export const loadNotionContent = async function(axios, pageId){
  const url = "https://notion-api.splitbee.io/v1/page/"+pageId;
  const resp = await axios({ 
    url,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    }
  });
  return resp.data;
}

export  const readImageFile = function(file, successFn, errorFn){
  // const filename = file.name;
  const imageType = /image.*/;
  const reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    const base64 = 'data:image/png;base64,'+contents.substr(contents.indexOf(',') + 1);
    successFn(base64);
  }
  if(file.type.match(imageType)){
    reader.readAsDataURL(file);  
  }else{
    errorFn();
  }
}

export const readableBigNumber = function(value,decimal) {
  const ethers = require('ethers');
  if(!value || !decimal){ return undefined; }
  return formatLargeNumber(parseFloat(ethers.utils.formatUnits(value, decimal.toNumber())));
}

// shareToRedeem in number, 
// shareTokenDecimal in BigNumber
// totalSupply in BigNumber
// totalAsset in BigNumber
// assetTokenDecimal in BigNumber
export const redeemable = function({shareToRedeem, shareTokenDecimal, totalSupply, assetTokenDecimal, totalAsset}) {
  const {BigNumber} = require('ethers');
  if(!shareToRedeem || !totalAsset){ return 0; }
  const toBigNumber = function(val){
    return BigNumber.isBigNumber(val)?val:BigNumber.from(val);
  }
  shareToRedeem = toBigNumber(shareToRedeem);
  shareTokenDecimal = BigNumber.from(10).pow(shareTokenDecimal.toNumber());
  totalAsset = toBigNumber(totalAsset);

  // console.log('******************************')
  // console.log('shareToRedeem: ',shareToRedeem.toString());
  // console.log('shareTokenDecimal: ',shareTokenDecimal.toString());
  // console.log('totalSupply: ',totalSupply.toString());
  // console.log('shareTokenDecimal: ',shareTokenDecimal.toString());
  // console.log('assetTokenDecimal: ',assetTokenDecimal.toString());
  // console.log('totalAsset: ',totalAsset.toString());
  
  const toReturn = shareToRedeem.mul(shareTokenDecimal).mul(totalAsset).div( totalSupply );
  return readableBigNumber(toReturn, assetTokenDecimal)
}

export const formatDisperseText = function(text, decimal, maxToSend) {
  const {BigNumber} = require('ethers');
  const fnSplit = function(str, seperator){
    return str.trim().split(seperator);
  }
  const seperators = [' ',',','='];
  const result = {
    addresses: [],
    value: [],
    display: [],
    total: 0
  };
  let total = 0;
  text.split('\n').forEach(str => {
    for(var i=0;i<seperators.length;i++){
      if(str.indexOf(seperators[i]) !== -1){
        const tmp = fnSplit(str, seperators[i]);
        result.addresses.push(tmp[0]);
        try{
          result.value.push(BigNumber.from(tmp[1]).mul(BigNumber.from(10).pow(decimal.toNumber())).toString());
        }catch(e){
          return {
            addresses: [],
            value: [],
            display: [],
            total: 0
          };
        }
        result.display.push({
          "address":tmp[0],
          "value":parseFloat(tmp[1])
        });
        total += parseFloat(tmp[1]);
      }
    }
  })
  result.total = total;
  if(total >= maxToSend){
    return {
      addresses: [],
      value: [],
      display: [],
      total: 0
    };
  }
  return result;
}