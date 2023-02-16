import { useMetaMask } from "metamask-react";
import { useEffect, useRef, useState } from 'react';
import Web3 from "web3";
import './App.css';

function App() {
  const { status, connect, account, chainId, addChain, switchChain, ethereum } = useMetaMask();
  const web3 = useRef(new (Web3)(window.ethereum)).current;
  const [checkFollow, setCheckFollow] = useState(false)
  const [signed, setSigned] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!account) {
      setIsSuccess(false);
    }
  }, [account])

  const getSigned = () => JSON.parse(window.localStorage.getItem('accounts')) || [];

  const addSignedAddress = (addr) => {
    var accounts = getSigned();
    accounts.push(addr)
    window.localStorage.setItem('accounts', JSON.stringify(accounts))
  }

  useEffect(() => {
    if (!account) return setSigned(false);
    var accounts = getSigned();
    var exists = accounts.filter(item => item.toLowerCase() == account.toLowerCase()).length > 0;
    setSigned(exists);
  }, [account])

  const ActionItem = ({ icon, title, desc, button, disabled, onAction = () => { } }) => {
    return (
      <div className={`contain ${disabled && 'disabled'}`}>
        <div className='description'>
          <img src={icon} />
          <div >
            <h2>{title}</h2>
            <span>{desc}</span>
          </div>
        </div>
        {button && <div className='action' onClick={onAction}>
          <p>{button}</p>
        </div>
        }
        {disabled && <div className="overlay" />}
      </div>
    )
  }
  const follow = () => {
    if (checkFollow) {
      setIsSuccess(true);
    } else {
      window.open('https://twitter.com/elonmusk', '_blank', 'noreferrer');
      setTimeout(() => {
        setCheckFollow(true);
      }, 1000);
    }
  }
  const generateKey = (length) => {
    var nonce = "";
    var allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      nonce = nonce.concat(allowed.charAt(Math.floor(Math.random() * allowed.length)));
    }
    return nonce;
  }
  const signMessage = async () => {
    const nonce = generateKey(10);
    const message = `This is the official message, Your nonce is: ${nonce}`;
    const signatureHash = await web3.eth.personal.sign(message, account)
    if (signatureHash) {
      const address = web3.eth.accounts.recover(message, signatureHash)
      if (address.toLowerCase() == account.toLowerCase()) {
        setSigned(true);
        addSignedAddress(address)
      }
    }
  }

  return (
    <div className="App">
      <div className="container">
        {status}
        {isSuccess ?
          <h1>Login Success</h1>
          :
          <>
            <ActionItem
              icon={'https://www.freenft.xyz/_next/static/media/active.0e50e7a2.svg'}
              title={account ? signed ? `Hello, ${account}` : 'Sign a message' : 'Connect your wallet'}
              desc={account ? signed ? `Wallet Connected` : 'prove this is your wallet' : 'Start the whitelist process'}
              button={account ? signed ? false : 'SIGN' : 'Connect'}
              onAction={() => {
                if (account) {
                  signMessage()
                } else {
                  setSigned(false);
                  connect();
                }
              }}
            />
            <ActionItem
              icon={'https://www.freenft.xyz/_next/static/media/inactive.47228843.svg'}
              title={'Follow elonmusk'}
              desc={'And connect your twitter'}
              button={checkFollow ? 'Submit' : 'Follow'}
              onAction={follow}
              disabled={!account || !signed}
            />
          </>
        }
      </div>
    </div>
  );
}

export default App;