import './App.css';
import { useState, useEffect } from 'react';
import {ethers} from "ethers";
import { GearFill } from "react-bootstrap-icons";
import BeatLoader from "react-spinners/BeatLoader"

import CurrencyField from './components/CurrencyField';
import { getWethContract, getUniContract, getPrice, runSwap } from './AlphaRouterService'

function App() {
  const [provider, setProvider] = useState(undefined)
  const [signer, setSigner] = useState(undefined)
  const [signerAddress, setSignerAddress] = useState(undefined)
  const [slippageAmount, setSlippageAmount] = useState(2)
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)

  const [inputAmount, setInputAmount] = useState(undefined)
  const [outputAmount, setOutputAmount] = useState(undefined)
  const [transaction, setTransaction] = useState(undefined)
  const [loading, setLoading] = useState(undefined)
  const [ratio, setRatio] = useState(undefined)
  const [wethContract, setWethContract] = useState(undefined)
  const [uniContract, setUniContract] = useState(undefined)
  const [wethAmount, setWethAmount] = useState(undefined)
  const [uniAmount, setUniAmount] = useState(undefined)

  useEffect(() => {
    initConnection();

  }, []);

  const initConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

    } else {
      console.log("Please install Metamask!");
    }

    const wethContract = getWethContract()
    setWethContract(wethContract)

    const uniContract = getUniContract()
    setUniContract(uniContract)
  }

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner();
    setSigner(signer);
  }

  const isConnected = () => signer !== undefined;

  const getWalletAddress = () =>  {
    signer.getAddress()
        .then(address => {
          setSignerAddress(address)

          //need to connect
          wethContract.balanceOf(address)
              .then(
                  res=> {
                    setWethAmount(Number(ethers.utils.formatEther(res)))
                  }
              )

          uniContract.balanceOf(address)
              .then(
                  res=> {
                    setUniAmount(Number(ethers.utils.formatEther(res)))
                  }
              )
        })
  } ;


  if (signer !== undefined) {
    getWalletAddress();
  }

  const getSwapPrice = (inputAmount) => {
    setLoading(true)
    setInputAmount(inputAmount)

    const swap = getPrice(
        inputAmount,
        slippageAmount,
        Math.floor(Date.now()/1000 + (deadlineMinutes * 60)),
        signerAddress
    ).then(
        data => {
          setTransaction(data[0])
          setOutputAmount(data[1])
          setRatio(data[2])
          setLoading(false)
        }
    )
  }

  return (
    <div className="App">

      <div className="appBody">
        <div className="swapContainer">
          <div className="swapHeader">
            <span className="swapText">
              Swap
            </span>
            <span className="gearContainer">
              <GearFill />
            </span>
          </div>

          <div className="swapBody">
            <CurrencyField
              field="input"
              tokenName="WETH"
              getSwapPrice={getSwapPrice}
              signer={signer}
              balance={wethAmount} />
            <CurrencyField
                field="output"
                tokenName="UNI"
                value={outputAmount}
                signer={signer}
                balance={uniAmount}
                spinner={BeatLoader}
                loading={loading}
            />
          </div>

          <div className="ratioContainer">
            {ratio && (
                <>
                  {`1 UNI = ${ratio} WETH`}
                </>
            )}
          </div>

          <div className="swapButtonContainer">
            {isConnected() ? (
                <div
                    onClick={() => runSwap(transaction, signer)}
                    className="swapButton"
                >
                  Swap
                </div>
            ) : (
                <div
                    onClick={() => getSigner(provider)}
                    className="swapButton"
                >
                  Connect Wallet
                </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default App;
