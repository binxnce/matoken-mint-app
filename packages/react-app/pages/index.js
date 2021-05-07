import React, { useState, useEffect } from "react";

import { useWeb3React } from "@web3-react/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from "@material-ui/core/styles";

import Form from "../components/Form";

const Index = ({ signerAddress, contract_1155}) => {
  const { account } = useWeb3React();

  const classes = useStyles();

  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trsHash, setTrsHash] = useState('');
  const [open, setOpen] = React.useState(false);

  return (
    <main className={classes.main}>
    {/** Modal for Network Error */}
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div className={classes.paper}>

        <Typography variant="h6" style={{ marginBottom: 15, color: 'tomato' }}>
          Error: {err}
        </Typography>

      </div>
    </Modal>
    <div className={classes.cont}>
      {
        //loadig message
        isLoading && <CircularProgress color="secondary" />
      }
      {
        //please connect wallet
        !account && <Typography variant="h6">Please connect your wallet</Typography>}
      {
        //load the form
        account && !trsHash && !isLoading &&
        <Form
          signerAddress={signerAddress}
          contract_1155={contract_1155}
          setIsLoading={setIsLoading}
          setTrsHash={setTrsHash}
          setErr={setErr}
          setOpen={setOpen}
        />
      }
      {
        //success message
        trsHash &&
        <Success
          trsHash={trsHash}
          setTrsHash={setTrsHash}
        />
      }
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
    close: {
      cursor: "pointer",
      position: "absolute",
      display: "block",
      padding: "2px 5px",
      lineheight: "20px",
      right: "10px",
      top: "10px",
      fontsize: "24px",
      background: "#ffffff",
      borderradius: "18px",
      border: "1px solid #cfcece",
    },
  },
}));

export default Index;
