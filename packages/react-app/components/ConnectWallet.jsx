import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import React from "react";
import Popup from "reactjs-popup";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
toast.configure();

import connectors, { activateConnector } from "../lib/connectors";

const ConnectWallet = ({ buttonClassName }) => {
  const web3ReactContext = useWeb3React();

  const onActivate = (connector) => {
    console.log(connector);
    activateConnector(connector, web3ReactContext, (error) => {
      if (error instanceof UnsupportedChainIdError) {
        toast("Incorrect network", { type: "error" });
      }
      if (error instanceof NoEthereumProviderError) {
        toast("No wallet detected", { type: "error" });
      }
    });
  };

  return (
    <Popup
      trigger={
        <button type="button" className={buttonClassName}>
          Connect Wallet
        </button>
      }
      position="bottom right"
      contentStyle={{
        width: "min-content",
        padding: "10px",
      }}
    >
      {connectors.map(({ name, displayName, connector }) => (
        <div key={name} className="flex hover:bg-gray-200">
          <button
            type="button"
            className="whitespace-nowrap p-2 focus:outline-none"
            onClick={() => onActivate(connector)}
          >
            {displayName}
          </button>
        </div>
      ))}
    </Popup>
  );
};

ConnectWallet.defaultProps = {
  buttonClassName: "mx-4 p-2",
};

export default ConnectWallet;
