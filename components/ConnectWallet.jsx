import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import React from "react";
import Popup from "reactjs-popup";
import 'reactjs-popup/dist/index.css';
import Button from "@material-ui/core/Button";

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
        <Button type="button" className={buttonClassName}>
          Connect Wallet
        </Button>
      }
      position="right center"
      contentStyle={{
        width: "min-content",
        padding: "30px",
        textAlign: "center",
        borderRadius: "15px",
      }}
      modal
      nested
    > 
   
      <span>
        Connect your wallet using one of the services below:
      </span>
      {connectors.map(({ name, displayName, connector }) => (
        <div key={name} className="flex hover:bg-gray-200">
          <Button
            type="button"
            className="whitespace-nowrap p-2 focus:outline-none"
            onClick={() => onActivate(connector)}
          >
            {displayName}
          </Button>
        </div>
      ))}
      

    </Popup>
  );
};

ConnectWallet.defaultProps = {
  buttonClassName: "mx-4 p-2",
};

export default ConnectWallet;