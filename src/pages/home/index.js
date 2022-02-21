import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Web3Modal from 'web3modal';
import Moralis from "moralis";
import WalletConnectProvider from '@walletconnect/web3-provider';
import Layout from "../../layout/layout";

const HomePage = (props) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWallet] = useState("");
  const [web3Modal, setWeb3Modal] = useState(null);
  let [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(0);
  const [balance, setBalance] = useState(0);
  const [tokenList, setTokenList] = useState([]);

  useEffect(()=>{
    init();
  }, [])

  async function init() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            56: 'https://bsc-dataseed.binance.org/'
          },
          network:'binance'
        }
      },
    };
    let web3_Modal = new Web3Modal({
      cacheProvider: false, // optional
      providerOptions, // required
      disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
      theme: {
        background: "rgb(39, 49, 56)",
        main: "rgb(199, 199, 199)",
        secondary: "rgb(136, 136, 136)",
        border: "rgba(195, 195, 195, 0.14)",
        hover: "rgb(16, 26, 32)"
      }
    });

    setWeb3Modal(web3_Modal);
  }

  async function onConnect() {
    console.log(walletConnected);
    if(!walletConnected) {
      try {
        provider = await web3Modal.connect();
      } catch(e) {
        console.log("Could not get a wallet connection", e);
        return;
      }
      setProvider(provider);
      // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
      });
      console.log('provider chain changed')
      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        fetchAccountData();
      });
      console.log('provider network changed')
      // Subscribe to networkId change
      provider.on("networkChanged", (networkId) => {
        fetchAccountData();
      });
      setWalletConnected(true);
      await refreshAccountData();
    } else {
      setWalletConnected(!walletConnected);
      await Disconnect();
    }
  }

  async function refreshAccountData() {
    console.log("refreshAccountData");
    await fetchAccountData(provider);
  }

  async function fetchAccountData() {
    let web3 = new Web3(provider);
    setWeb3(web3);

    const accounts = await web3.eth.getAccounts();
    const wallet = accounts[0];
    setWallet(wallet);

    const serverUrl = "https://hpa9cnk4hutf.usemoralis.com:2053/server";
    const appId = "6lo08VCy5tbCTH2yv7JjmO50Ikd2m0TJcyD6rHeD";
    Moralis.start({ serverUrl, appId });

    const options = { chain: 'bsc', address: wallet}
    const balances = await Moralis.Web3API.account.getTokenBalances(options);
    
    setTokenList(balances);

    const balance = await Moralis.Web3API.account.getNativeBalance(options);
    console.log(balance.balance);
    console.log(parseInt(balance.balance)/10**18);
  }

  async function Disconnect() {
    if(provider.close) {
      await provider.close();
  
      await web3Modal.clearCachedProvider();
      setProvider(null);
    }
    setWalletConnected(false);
  }

  const handleTokenTypeChange = (e) => {
    console.log(e.target.value);
    setBalance(parseInt(tokenList[e.target.value].balance)/10**parseInt(tokenList[e.target.value].decimals));
  }

  const deposit = [
    {
      token: "Token 1",
      qty: 0.01,
    },
    {
      token: "Token 1",
      qty: 0.01,
    },
    {
      token: "Token 1",
      qty: 0.01,
    },
  ]

  const burned = [
    {
      token: "Token 1",
      qty: 0.01,
      date:"today"
    },
    {
      token: "Token 1",
      qty: 0.01,
      date:"today"
    },
    {
      token: "Token 1",
      qty: 0.01,
      date:"today"
    },
  ]
  return (
    <Layout>
      <div className="flex items-center justify-center p-8">
        <div className="p-8 bg-gray-300 rounded-md flex flex-col gap-12 sm:max-w-xl w-full">
          <div className="flex justify-between items-center gap-4">
            <h1>Burning </h1>
            <button className="truncate text-white bg-blue-800 rounded-md border border-blue-900 px-8 py-2"  onClick={() => { onConnect() }}>
              {walletConnected ? ( 
                "Connected: " +
                String(walletAddress).substring(0, 6) +
                "..." +
                String(walletAddress).substring(38)
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>
          <div className="flex gap-2 justify-start sm:flex-row flex-col">
            <div className="flex gap-6" >
            <div className="flex flex-col w-1/2 sm:w-auto">
              <p className="truncate">Choose token to burn</p>
              <select onChange={e => handleTokenTypeChange(e)}>
                {walletConnected &&
                  tokenList.map((data, idx) => (
                    <option key={idx} value={idx}>{data.symbol}({parseInt(data.balance)/10**(parseInt(data.decimals))})</option>
                  ))
                }
              </select>
            </div>
            <input className="w-1/2 border border-blue-900 rounded-md px-8 py-2"/>
            </div>
            <button className="text-white bg-blue-800 rounded-md border border-blue-900 px-8 py-2">
              Deposit
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <p>My deposit</p>
            <table>
              <tr>
                <th>Token</th>
                <th>Qty</th>
                <th>Burn</th>
              </tr>
              <tbody>
                {deposit.map((data, idx) => (
                  <tr key={idx}>
                    <td className="text-center">{data.token}</td>
                    <td className="text-center">{data.qty}</td>
                    <td className="text-center">
                      <button className="text-white bg-blue-800 rounded-md border border-blue-900 px-4 py-1">
                        Burn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2">
            <p>My Burned</p>
            <table>
              <tr>
                <th>Token</th>
                <th>Qty</th>
                <th>Burn</th>
              </tr>
              <tbody>
                {burned.map((data, idx) => (
                  <tr key={idx}>
                    <td className="text-center">{data.token}</td>
                    <td className="text-center">{data.qty}</td>
                    <td className="text-center">
                      {data.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default HomePage