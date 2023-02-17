import { useMetaMask } from "metamask-react";
import { useEffect, useRef, useState } from 'react';
import Web3 from "web3";
import './App.css';
import TwitterLogin from "react-twitter-login-button";
import Twit from 'twit'

const CONSUMER_KEY = 'HBYTFXybFo1l7on7D2d8jio8m';
const CONSUMER_SECRET = 'Z9cTjh7MBdnKSFHfuJ2VG7hTitNpb8U8vBY7N6DyiSaOVRN7mE';
// const CONSUMER_KEY = 'cUVVWlUzbjNlLVlUcldUNUg5Wk06MTpjaQ';
// const CONSUMER_SECRET = 'tE-6vJ3KxMFz6QtpFJ_LbyHP8s0bacGCnJ31hkV9FISq5C2KXf';

function App() {
  const { status, connect, account } = useMetaMask();
  const web3 = useRef(new (Web3)(window.ethereum)).current;
  const [twitterUser, setTwitterUser] = useState("vaingloriousETH")
  const [isFollowed, setIsFollowed] = useState(false)
  const [signed, setSigned] = useState(false)
  const twitterClient = useRef();

  const authHandler = (err, data) => {
    if (err) {
      alert("Twitter login error");
      console.log(err);
      return;
    }
    const { oauth_token, oauth_token_secret } = data;
    twitterClient.current = new Twit({
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
      access_token: oauth_token,
      access_token_secret: oauth_token_secret
      // access_token: '1480998136407486464-Jd8M9hHvCRokbb6aAMuhgIxu3cBGU3',
      // access_token_secret: 'DKu5UL4PVsjJH2NR1g3NX2ezivRJgDU1baLgLXSbe0xt2',
    });
    twitterClient.current.get('account/verify_credentials', { tweet_mode: "extended" }, function (err, data, response) {
      if (err) {
        console.log(err);
        alert("get verify status error");
        setIsFollowed(false);
      } else {
        setTwitterUser(data.screen_name)
      }
    });
  };

  const verifyFolled = () => {
    if (!twitterClient) {
      setIsFollowed(false);
      alert("login failed");
      return;
    }
    const elonMuskScreenName = 'elonmusk';
    twitterClient.current.get('friends/ids', { screen_name: twitterUser }, function (err, data, response) {
      if (err) {
        console.log(err);
        alert("get verify status error");
        setIsFollowed(false);
      } else {
        const followingElonMusk = data.ids.includes(44196397);
        console.log(`Is ${twitterUser} following ${elonMuskScreenName}? ${followingElonMusk}`);
        setIsFollowed(followingElonMusk);
      }
    });
  }

  const getSigned = () => JSON.parse(window.localStorage.getItem('accounts')) || [];

  const addSignedAddress = (addr) => {
    var accounts = getSigned();
    accounts.push(addr)
    window.localStorage.setItem('accounts', JSON.stringify(accounts))
  }

  useEffect(() => {
    if (!account) return setSigned(false);
    var accounts = getSigned();
    var exists = accounts.filter(item => item.toLowerCase() === account.toLowerCase()).length > 0;
    setSigned(exists);
  }, [account])

  const ActionItem = ({ icon, title, desc, button, disabled, onAction = () => { }, actionComponent }) => {
    return (
      <div className={`contain ${disabled && 'disabled'}`}>
        <div className='description'>
          <img src={icon} alt={title} />
          <div >
            <h2>{title}</h2>
            <span>{desc}</span>
          </div>
        </div>

        {button ?
          actionComponent ?
            actionComponent()
            :
            <div className='action' onClick={onAction}>
              <p>{button}</p>
            </div>
          :
          <></>
        }
        {/* {disabled && <div className="overlay" />} */}
      </div>
    )
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
      if (address.toLowerCase() === account.toLowerCase()) {
        setSigned(true);
        addSignedAddress(address)
      }
    }
  }

  return (
    <div className="App">
      <div className="container">
        {status}
        {isFollowed ?
          <h2>
            Login Success
            <br />
            {twitterUser}
            <br />
            {account}
          </h2>
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
              button={twitterUser ? 'verify' : 'Follow'}
              actionComponent={() => (
                <TwitterLogin
                  className={'action'}
                  authCallback={authHandler}
                  consumerKey={CONSUMER_KEY}
                  children={<p>{"Follow"}</p>}
                  consumerSecret={CONSUMER_SECRET}
                />
              )}
              onAction={verifyFolled}
              disabled={!account || !signed}
            />
          </>
        }
      </div>
    </div>
  );
}

export default App;