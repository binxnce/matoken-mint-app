import React from "react";
import Link from "next/link";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import ConnectWallet from "./ConnectWallet";
import { useWeb3React } from "@web3-react/core";

const Navbar = () => {
  const { account } = useWeb3React();

  const classes = useStyles();

  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar className={classes.rootTool}>
        <Link href="/">
          <a>
            <img src="/logo.svg" alt="MAToken Press | Press Music Album NFTs to the blockchain" className={classes.img} />
          </a>
        </Link>

{/*        <Typography variant="h6" className={classes.title}>
          MAToken Press 
        </Typography>

        <div className={classes.divider}></div>

        <Typography variant="h6" className={classes.title2}>
          Press music album NFTs to the Blockchain
        </Typography>
*/}
        <div className={classes.gap}></div>

        {!account && <ConnectWallet />}
        {account && (
          <Typography variant="h6" className={classes.title2}>
            {account}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: "auto",
    backgroundColor: "#F8F9FA",
    padding: "10px 70px",
    boxShadow: "none",
    [theme.breakpoints.down("xs")]: {
      padding: "10px 0px",
    },
  },
  rootTool: {
    [theme.breakpoints.down("xs")]: {
      padding: "0px 5px",
    },
  },
  img: {
    width: 220,
    marginRight: 20,
    [theme.breakpoints.down("xs")]: {
      width: 180,
      marginLeft: 10,
    },
  },
  title: {
    // fontFamily: 'Manrope',
    fontWeight: 400,
    fontSize: 22,
    color: "#061024",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  divider: {
    width: 36,
    border: "0.9px solid #8247E5",
    transform: "rotate(90deg)",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  title2: {
    fontWeight: "normal",
    fontSize: 17,
    color: "#061024",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  gap: {
    flexGrow: 1,
  },
  social: {
    // position: 'absolute',
    display: "flex",
    right: 20,
    [theme.breakpoints.down("xs")]: {
      right: 0,
    },
  },
  socialImg: {
    width: 35,
    display: "block",
    margin: "auto",
    marginRight: 10,
    [theme.breakpoints.down("xs")]: {
      marginRight: 4,
    },
  },
}));

export default Navbar;
