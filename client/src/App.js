import './App.css';
import { useState, useEffect } from 'react';
import {ethers} from "ethers";
import { GearFill } from "react-bootstrap-icons";
import BeatLoader from "react-spinners/BeatLoader"

function App() {
  const [provider, setProvider] = useState(undefined)
  const [signer, setSigner] = useState(undefined)
  const [signerAddress, setSignerAddress] = useState(undefined)

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
        })
  } ;

  useEffect(() => {
    initConnection();
  }, []);


  if (signer !== undefined) {
    getWalletAddress();
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



          <div className="swapButtonContainer">
            {isConnected() ? (
                <div
                  //  onClick={() => runSwap(transaction, signer)}
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
