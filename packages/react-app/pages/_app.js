import React from "react";
import Head from "next/head";

import { Web3ReactProvider } from "@web3-react/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import * as ethers from "ethers";

import Navbar from "../components/Navbar";
import Web3ReactManager from "../components/Web3ReactManager";

const App = ({ Component, pageProps }) => {
  return (
    <React.Fragment>
      <Head>
        <title>MAToken Mint</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <Web3ReactProvider
        getLibrary={(provider) => new ethers.providers.Web3Provider(provider)}
      >
        <Web3ReactManager>
          <Navbar {...pageProps} />
          <Component {...pageProps} />
        </Web3ReactManager>
      </Web3ReactProvider>
    </React.Fragment>
  );
};

export default App;
