import * as React from 'react';
import {useState} from 'react';
import axios from 'axios';
import { useAccount, useContractEvent, useContractReads, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { ShareTokenAbi, AssetTokenAbi, DisperseAbi, DisperseContractAddress } from '../config';
import { useParams } from 'react-router-dom';
import { BigNumber, ethers } from 'ethers';
import { loadPintaImage, loadNotionContent, formatDisperseText } from '../Utils';
import { useUIHelper } from '../context/UIHelperContext';
import ProjectDetail from '../components/ProjectDetail';
import { formatUnits } from 'ethers/lib/utils';

function Funding() {
  const account = useAccount();
  const [assetAddress, setAssetAddress] = useState('');
  const [totalAsset, setTotalAsset] = useState(BigNumber.from(0));
  const [assetSymbol, setAssetSymbol] = useState('');

  const [shareTokenName, setShareTokenName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [shareTokenAbout, setShareTokenAbout] = useState('');
  const [shareTokenSymbol, setShareTokenSymbol] = useState('');
  const [shareTokenTotalSupply, setShareTokenTotalSupply] = useState('');
  
  const [myShare, setMyShare] = useState(BigNumber.from(0));
  const [myAsset, setMyAsset] = useState(BigNumber.from(0));

  const [assetTokenDecimal, setAssetTokenDecimal] = useState(BigNumber.from(1));
  const [shareTokenDecimal, setShareTokenDecimal] = useState(BigNumber.from(1));

  const { setSuccessMessage } = useUIHelper();

  const {address} = useParams();
  const shareTokenContract = {
    addressOrName: address,
    contractInterface: ShareTokenAbi
  }
  const assetTokenContract = {
    addressOrName: assetAddress,
    contractInterface: AssetTokenAbi
  }
  const disperseContract = {
    addressOrName: DisperseContractAddress,
    contractInterface: DisperseAbi
  }
  const contractRead = useContractReads({
    contracts: [
      {
        ...shareTokenContract,
        functionName: 'name'
      },
      {
        ...shareTokenContract,
        functionName: 'symbol'
      },
      {
        ...shareTokenContract,
        functionName: 'avatar'
      },
      {
        ...shareTokenContract,
        functionName: 'about'
      },
      {
        ...shareTokenContract,
        functionName: 'totalSupply',
      },
      {
        ...shareTokenContract,
        functionName: 'asset'
      },
      {
        ...shareTokenContract,
        functionName: 'balanceOf',
        args: [account.address],
      },
      {
        ...assetTokenContract,
        functionName: 'symbol'
      },
      {
        ...assetTokenContract,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        ...assetTokenContract,
        functionName: 'balanceOf',
        args: [account.address],
      },
      {
        ...shareTokenContract,
        functionName: "decimals"
      },
      {
        ...assetTokenContract,
        functionName: "decimals"
      },
      {
        ...shareTokenContract,
        functionName: "allowance",
        args: [account.address, DisperseContractAddress]
      },
    ],
    // watch: true,
    onSuccess: async (data) => {
      setShareTokenName(data[0]);
      setShareTokenSymbol(data[1]);
      if(data[2] !== ""){
        setAvatar(loadPintaImage(data[2]));
      }
      if(data[3] !== ""){
        setShareTokenAbout(await loadNotionContent(axios, data[3]));
      }
      setShareTokenTotalSupply(data[4]  ?? BigNumber.from(0));
      setAssetAddress(data[5]);
      setMyShare(data[6] ?? BigNumber.from(0));
      setAssetSymbol(data[7]);
      setTotalAsset(data[8] ?? BigNumber.from(0));
      setMyAsset(data[9] ?? BigNumber.from(0));
      setShareTokenDecimal(data[10]);
      setAssetTokenDecimal(data[11]);
      setDisperseAllowance(data[12]);
      setLoading(false);
    }
  })
  const [isLoading, setLoading] = useState(true);
  
  /**
   * Deposit
   */
  const [toDeposit, setToDeposit] = useState('');
  const [depositTxnHash, setDepositTxnHasnh] = useState('');  
  const _depositAmount = assetTokenDecimal && toDeposit && !isNaN(toDeposit) ? ((BigNumber.from(10).pow(assetTokenDecimal.toNumber())).mul(toDeposit)).toString() : "0";
  const { config: prepareDeposit } = usePrepareContractWrite({
    ...assetTokenContract,
    functionName: 'transfer',
    args: [address, _depositAmount]
  })
  const deposit = useContractWrite({
    ...prepareDeposit,
    onSuccess: function({hash}) {
      setToDeposit(0);
      setDepositTxnHasnh(hash);
    }
  });
  useWaitForTransaction({
    hash: depositTxnHash,
    onSuccess: function(data) {
      setSuccessMessage('Successfully deposit, check the total asset');
      // console.log('depositTxn: ',data);
      setLoading(false);
      contractRead.refetch();
    }
  });
  /**
   * Redeem
   */
  const [toRedeem, setToRedeem] = useState(0);
  const [redeemTxnHash, setRedeemTxnHasnh] = useState('');
  const { config: prepareRedeem } = usePrepareContractWrite({
    ...shareTokenContract,
    functionName: 'redeem',
    args: [BigNumber.from(toRedeem).mul(BigNumber.from(10).pow(BigNumber.from(shareTokenDecimal))).toString()]
  })
  const redeem = useContractWrite({
    ...prepareRedeem,
    onSuccess: function({hash}){
      setToRedeem(0);
      setRedeemTxnHasnh(hash);
    }
  })
  useWaitForTransaction({
    hash: redeemTxnHash,
    onSuccess: function(daa) {
      setSuccessMessage('Successfully redeem, check your asset balance');
      // console.log('depositTxn: ',data);
      setLoading(false);
      contractRead.refetch();
    }
  })
  /**
   * Burn
   */
  const [toBurn, setToBurn] = useState(0);
  const [burnTxnHash, setBurnTxnHasnh] = useState('');
  const { config: prepareBurn } = usePrepareContractWrite({
    ...shareTokenContract,
    functionName: 'burn',
    args: [BigNumber.from(toBurn).mul(BigNumber.from(10).pow(BigNumber.from(shareTokenDecimal))).toString()]
  })
  const burn = useContractWrite({
    ...prepareBurn,
    onSuccess: function({hash}){
      setToBurn(0);
      setBurnTxnHasnh(hash);
    }
  })
  useWaitForTransaction({
    hash: burnTxnHash,
    onSuccess: function(daa) {
      setSuccessMessage('Successfully burn, check your share balance');
      // console.log('depositTxn: ',data);
      setLoading(false);
      contractRead.refetch();
    }
  })
  /**
   * Disperse
   */
  const [toDisperse, setToDisperse] = useState('');
  const [disperseTxnHash, setDisperseTxnHasnh] = useState('');
  const _maxToRedeem = parseFloat(formatUnits(myShare, shareTokenDecimal.toNumber()));
  const _formatedDisperse = formatDisperseText(toDisperse, shareTokenDecimal, _maxToRedeem);
  const { config: prepareDisperse } = usePrepareContractWrite({
    ...disperseContract,
    functionName: 'disperseTokenSimple',
    args: [
      address,
      _formatedDisperse.addresses??[], // receipient list
      _formatedDisperse.value??[] // receipient value
    ]
  });
  const disperse = useContractWrite({
    ...prepareDisperse,
    onSuccess: function({hash}){
      setToBurn(0);
      setDisperseTxnHasnh(hash);
    }
  });
  useWaitForTransaction({
    hash: disperseTxnHash,
    onSuccess: function(data) {
      setSuccessMessage('Successfully sent check your share balance');
      // console.log('depositTxn: ',data);
      setLoading(false);
      setToDisperse('');
      contractRead.refetch();
    }
  });
  /**
   * Allowance Disperse
   */
  const [disperseAllowance, setDisperseAllowance] = useState(BigNumber.from(0));
  const [disperseAllownaceTxnHash, setDisperseAllowanceTxnHasnh] = useState('');
  const { config: prepareDisperseAllowance } = usePrepareContractWrite({
    ...shareTokenContract,
    functionName: 'approve',
    args: [
      DisperseContractAddress, ethers.constants.MaxUint256.toString()
    ]
  });
  const allowDisperse = useContractWrite({
    ...prepareDisperseAllowance,
    onSuccess: function({hash}){
      setDisperseAllowanceTxnHasnh(hash);
    }
  });
  useWaitForTransaction({
    hash: disperseAllownaceTxnHash,
    onSuccess: function(data) {
      setSuccessMessage('Successfully approve Disperse contract');
      // console.log('depositTxn: ',data);
      setLoading(false);
      contractRead.refetch();
    }
  }); 
  /**
   * Redeem event
   */
  useContractEvent({
    ...shareTokenContract,
    eventName: "Redeemed",
    listener: (node, label, owner) => {
      const iface = new ethers.utils.Interface(ShareTokenAbi);
      console.log(iface.parseLog(node[2]));
      console.log("node:",node);
    }
  })

  const previewProps = {
    name: shareTokenName, avatarBase64: avatar, symbol: shareTokenSymbol, totalSupply: shareTokenTotalSupply, 
    aboutContent: shareTokenAbout, shareTokenDecimal,
    asset: assetAddress, assetSymbol, creationTxn: undefined, totalAsset, assetTokenDecimal,
    myShare, myAsset,
    deposit, toDeposit, setToDeposit, 
    redeem, toRedeem, setToRedeem, 
    burn, toBurn, setToBurn,
    allowDisperse, disperseAllowance, 
    disperse, toDisperse, setToDisperse,
    isLoading, setLoading,
  };
  
  return (
    <>
      <ProjectDetail {...previewProps} />
    </>
  )
}

export default Funding;