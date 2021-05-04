import React, { useState } from "react";

import { useWeb3React } from "@web3-react/core";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { Button, TextField } from "@material-ui/core";
import * as ethers from "ethers";

const Bridge = () => {
  const { account, library } = useWeb3React();

  const classes = useStyles();

  const [amount, setAmount] = useState();
  const [token, setToken] = useState();

  const [currentError, setCurrentError] = useState();

  return (
    <main className={classes.main}>
      <Modal
        open={currentError !== undefined}
        onClose={() => setCurrentError(undefined)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.paper}>
          <Typography
            variant="h6"
            style={{ marginBottom: 15, color: "tomato" }}
          >
            Error: {currentError}
          </Typography>
        </div>
      </Modal>

      <div className={classes.cont}>
        {!account && (
          <Typography variant="h6">Please connect your wallet</Typography>
        )}

        {account && (
          <>
            <Typography variant="h5">Bridge</Typography>

            <br />

            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />

            <br />
            <br />

            <TextField
              label="Token address"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />

            <br />
            <br />

            <Button
              onClick={async () => {
                const iface = new ethers.utils.Interface([
                  "function approve(address account, uint256 amount)",
                  "function deposit(address token, address recipient, uint256 amount)",
                ]);

                const tokenContract = new ethers.Contract(
                  token,
                  iface,
                  library.getSigner()
                );

                const bridgeRootTunnelContract = new ethers.Contract(
                  "0x30e1fD6748aBF05AC7969c6235e9C7bC6b297A13",
                  iface,
                  library.getSigner()
                );

                // Step 1 - Approve the bridge
                await tokenContract
                  .connect(library.getSigner())
                  .approve(
                    bridgeRootTunnelContract.address,
                    ethers.utils.parseEther(amount)
                  )
                  .then((tx) => tx.wait())
                  .then(() =>
                    // Step 2 - Deposit to the bridge
                    bridgeRootTunnelContract
                      .connect(library.getSigner())
                      .deposit(token, account, ethers.utils.parseEther(amount))
                      .then((tx) => tx.wait())
                  );
              }}
            >
              Execute
            </Button>
          </>
        )}
      </div>
    </main>
  );
};

const useStyles = makeStyles((theme) => ({
  main: {
    width: "100%",
    margin: "10px auto",
    marginBottom: 20,
    textAlign: "center",
    backgroundImage: 'url(${"/img/matoken-background.png"})',
    [theme.breakpoints.down("xs")]: {
      marginTop: "20px",
    },
  },
  paper: {
    position: "absolute",
    width: 400,
    top: "45%",
    left: "37%",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  title: {
    marginBottom: 20,
  },
  cont: {
    maxWidth: 1300,
    minHeight: 634,
    height: "max-content",
    margin: "auto",
    padding: 40,
    background: "#FFFFFF",
    boxShadow:
      "0px 2px 4px rgba(0, 0, 0, 0.08), 0px 8px 12px rgba(0, 0, 0, 0.04)",
    borderRadius: 20,
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      padding: 10,
    },
  },
}));

export default Bridge;
