import React from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { fontSize } from '../utils/variables';
import CategoryNav from '../components/CategoryNav';

const Container = styled(Col)`
  padding: 40px 0 30px 0;
  font-weight: normal;
  font-size: ${fontSize.s};
`;

const Question = styled.div`
  font-weight: bold;
  display: block;
`;

const Answer = styled.div`
  margin-left: 30px;
  margin-bottom: 20px;
  margin-top: 10px;
  padding: 10px;
  display: block;
  border-left: 5px solid #eee;
  border-right: 5px solid #eee;
  border-radius: 10px;
  background-color: #fcfcfc;
`;

const About = () => {
  return (
    <>
      <Row>
        <Col>
          <CategoryNav />
          <br />
        </Col>
      </Row>
      <Row>
        <Container>
          <h3>About</h3>
          <hr />
          <p>
            matokenswap is a marketplace for digital art. It&apos;s designed to be inclusive and mindful of{' '}
            <i>shared ownership</i>. matokenswap allows an artist to sell his artwork to a collective of owners, empowering
            the community and fans to own a shard of the artwork.
          </p>
          <br />
          <p>
            Have ideas or suggestions? Reach us at{' '}
            <a href="mailto:matokenswap@pillarproject.io">matokenswap@pillarproject.io</a>
          </p>
          <p>
            <br />
          </p>
          <h2>FAQ</h2>
          <hr />
          <ul>
            <li>
              <Question>How to get started? </Question>
              <Answer>
                <p>
                  Click the <b>Start</b> button in the top right. If this is your first experience with crypto, choose{' '}
                  <b>Social Login</b> to sign in using your Facebook, Google, Twitter, or Discord profile.
                </p>
                <br />
                <p>
                  Alternatively, you can use a{' '}
                  <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer">
                    MetaMask
                  </a>{' '}
                  browser extension.
                </p>
                <br />
                <p>
                  In order to start swapping memes, you’ll need to have DAI or xDai in your crypto wallet. xDai is a
                  native cryptocurrency of the network that matokenswap lives on. Learn more about it{' '}
                  <a
                    href="https://jaredstauffer.medium.com/what-is-xdai-how-do-i-use-xdai-a-simple-explanation-7440cbaf1df6"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    here
                  </a>
                  .
                </p>
              </Answer>
            </li>
            <li>
              <Question>How to top up my Dank balance?</Question>
              <Answer>
                <p>
                  Go to <a href="/">matokenswap’s main page</a>, click on the address that shows up next to your $ balance
                  in the top right corner. In the pop up you’ll see 2 top-up options.
                </p>
                <br />
                <ul>
                  <li>
                    <b>
                      <u>If you don’t have DAI in your wallet…</u>
                    </b>
                    <p>
                      <br />
                    </p>
                    <p style={{ marginLeft: '15px' }}>
                      Click on <b>Top up with Credit Card</b>.<br />
                      Choose the amount, your local currency, and the payment method. <br />
                      Paste your Dank wallet address in the <b>YOUR XDAI ADDRESS</b> field and finish the process.
                    </p>
                    <p>
                      <br />
                    </p>
                  </li>
                  <li>
                    <b>
                      <u>If you already have DAI in your wallet...</u>
                    </b>
                    <p>
                      <br />
                    </p>
                    <p style={{ marginLeft: '15px' }}>
                      Click on the <b>Top up via Bridge</b>.<br />
                      Choose the amount of DAI you want to top up with, and wait a few seconds for the transaction to
                      get confirmed.
                    </p>
                    <p>
                      <br />
                      <u>
                        <i>!Make sure you have some ETH in your wallet to cover the first transaction fee!</i>
                      </u>
                    </p>
                  </li>
                </ul>
                <br />
                <p>
                  Once you see <b>Your Dank balance on xDai network</b> updated, you&apos;re all set to start swapping
                  your memes.
                </p>
              </Answer>
            </li>
            <li>
              <Question>How much $$$ do I need?</Question>
              <Answer>
                As much as you want to buy and sellmusic albumsfor. The minimum top-up via the bridge is 0.005 DAI, but
                depending on how much DAI/xDai you’ll have on your Dank balance, that amount can become the maximum
                total value of the meme you’re putting for sale.
              </Answer>
            </li>
            <li>
              <Question>How to create my first meme?</Question>
              <Answer>
                <p>1. Click on the plus button in the bottom right. </p>
                <p>
                  2. Fill out all the fields and determine the number of shards you want to fractionalize your meme to.
                  You can choose between 100 and 1000 shards.
                </p>
                <p>
                  3. Upload your image or GIF and click on the <b>Create</b> button.
                </p>
                <p>
                  4. Confirm by clicking <b>Sign</b> on the following screen.
                </p>
                <p>
                  5. Confirm the request that will pop up from your MetaMask extension by clicking <b>Sign</b>.
                </p>
                <p>
                  6. Once the message is successfully signed, you will be redirected to <b>Created memes</b> tab in your
                  dashboard.
                </p>
              </Answer>
            </li>
            <li>
              <Question>How to make my meme available for sale?</Question>
              <Answer>
                <p>
                  Start from the{' '}
                  <b>
                    <a href="/me/created-memes">Created</a>
                  </b>{' '}
                  tab in your dashboard (My collection){' '}
                </p>
                <p>
                  1. In the newly created meme, click on the <b>Manage liquidity</b> button. Here&apos;s where you{' '}
                  determine how many shards will be available for sale on matokenswap.
                </p>
                <p>
                  2. In the <b>Add</b> section, set this meme&apos;s total value and choose how many shards you want to
                  make available for sale.
                </p>
                <p>
                  3. Click on the <b>Add</b> button, confirm on the next screen by clicking <b>Sign</b>.
                </p>
                <p>
                  4. Confirm the request that will pop up from your MetaMask extension by clicking <b>Sign</b>.
                </p>
                <p>
                  5. Once the transaction is confirmed, your meme will show up on the main screen and in the category
                  you&apos;ve added it to, so others will be able to buy a fraction of it.
                </p>
              </Answer>
            </li>
            <li>
              <Question>How to change the number of shards available for sale?</Question>
              <Answer>
                <p>
                  If you wish to add more shards to the market, simply repeat the process you went through previously
                  and add new amounts in the <b>Total</b> value and <b>Deposit shards</b> fields.
                </p>
                <br />
                <p>
                  If you wish to withdraw some shards from the market, go to <b>My collection</b> in the top navigation,
                  click on the <b>Created</b> tab, and there on <b>Manage liquidity</b>. Go to the <b>Remove</b>{' '}
                  section, choose the number of shards to withdraw,
                  <b>Confirm</b> and <b>Sign</b> the MetaMask signature request.
                </p>
              </Answer>
            </li>
          </ul>
          <p>
            <br />
          </p>
        </Container>
      </Row>
    </>
  );
};

export default About;
