import React from "react";

import { useWeb3React } from "@web3-react/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

import Form from "../components/Form";

const Index = () => {
  const { account } = useWeb3React();

  const classes = useStyles();

  return (
    <main className={classes.main}>
      <div className={classes.cont}>
        {!account && <p>Please connect your wallet</p>}
        {account && <Form />}
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

export default Index;
