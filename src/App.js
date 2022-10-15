import Layout from './Layout';
import Factory from './pages/Factory';
import Funding from './pages/Funding';
import Demo from './pages/Demo';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { UIHelperProvider } from './context/UIHelperContext';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from "wagmi/providers/public";
import { BSCTestnet, BSC } from "./config";

// const { chains, provider } = configureChains( // multichain config?
const { provider } = configureChains(
  [BSCTestnet, BSC],
  [jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) }), publicProvider()],
)
const client = createClient({
  autoConnect: true,
  provider
})

function App() {
  return (
    <WagmiConfig client={client}>
      <UIHelperProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Factory />} />
              <Route exact path="/:address" element={<Funding />} />
              <Route exact path="/demo" element={<Demo />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UIHelperProvider>
    </WagmiConfig>
  );
}

export default App;
