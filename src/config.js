export const BSCTestnet = {
  name: 'Smart Chain - Testnet',
  network: 'binance-testnet',
  id: 97,
  rpcUrls: {
    default: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  },
  nativeCurrency: {
    name: 'Smart Chain - Testnet',
    symbol: 'TBNB',
    decimals: 18,
  },
}

export const BSC = {
  name: 'Smart Chain',
  network: 'BSC',
  id: 56,
  rpcUrls: {
    default: 'https://bsc-dataseed.binance.org/',
  },
  nativeCurrency: {
    name: 'BSC Native Coin',
    symbol: 'BNB',
    decimals: 18,
  },
}

// multi-chain support?

// bsc testnet
export const FactoryContractAddress = "0xb1a0aa057fcd65980f14aaabcbc8c429bd1e1194";
export const DisperseContractAddress = "0xB4704a493F49Ab9b526BB2F5AE0F01e89ADbbaf4";

export const FactoryAbi = [
  "event Created(address shareToken)",
  "function create(address _asset,string memory _name,string memory _symbol,uint256 _totalSupply,string memory _about,string memory _avatar) public"
];

export const ShareTokenAbi = [
  "function totalAssets() public view returns (uint256)",
  "function convertToAsset(uint256) public view returns (uint256)",
  "function about() public view returns (string)",
  "function asset() public view returns (address)",
  "function avatar() public view returns (string)",
  "function balanceOf(address) public view returns (uint256)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "function redeem(uint256) public",
  "function decimals() public view returns (uint256)",
  "function transfer(address, uint256)",
  "function burn(uint256)",
  "function allowance(address, address) public view  returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "event Redeemed(address indexed, uint256)"
]

export const AssetTokenAbi = [
  "function balanceOf(address) public view returns (uint256)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function transfer(address, uint256)",
  "function mint(uint256, address)"
]

export const DisperseAbi = [
  "function disperseEther(address[], uint256 [])",
  "function disperseToken(address, address[], uint256[])",
  "function disperseTokenSimple(address, address[], uint256[])"
]

// bsc mainnet
// export const FactoryContractAddress = "0xc6906032b0f9233084688d51c0931e21daabd937"; // mainnet
// export const DisperseContractAddress = "0xd152f549545093347a162dce210e7293f1452150";