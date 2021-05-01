import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import * as ethers from "ethers";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useWeb3React } from "@web3-react/core";

import { pinJSONToIPFS, pinFileToIPFS } from "../utils/ipfs";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
toast.configure();

import NFTMinter from "../abis/NFTMinter.json";

const Form = ({
  signerAddress,
  contract_1155,
  setIsLoading,
  setTrsHash,
  setErr,
  setOpen
}) => {
  const { account, library } = useWeb3React();

  const classes = useStyles();

  // Hooks
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [surl, setSurl] = useState('');
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [imgHash, setImgHash] = useState("");
  const [ercTwoNum, setErcTwoNum] = useState(1);
  const [errors, setErrors] = useState({
    name: "",
    desc: "",
    file: "",
  });

  // Validate form
  const validateName = () => {
    if (name === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: "Name cannot be empty",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, name: "" }));
    }
  };
  const validateDescription = () => {
    if (description === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        desc: "Add description for your token",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, desc: "" }));
    }
  };

  // Handle file upload
  const handleFile = async (event) => {
    if (event.target.files[0]?.size < 1e7) {
      setFile(event.target.files[0]);

      const cid = await pinFileToIPFS(event.target.files[0]);
      toast("File uploaded to IPFS", { type: "success" });

      setImgHash(cid);
      setErrors((prevErrors) => ({ ...prevErrors, file: "" }));

      if (event.target.files.length !== 0) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImgSrc(event.target.result);
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        file: "File should be less than 10MB",
      }));
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    validateName();
    validateDescription();

    if (name && description && file && imgHash) {
      // Upload files on IPFS
      let ipfsHash = "";
      try {
        ipfsHash = await pinJSONToIPFS({
          name,
          description,
          image: "https://gateway.pinata.cloud/ipfs/" + imgHash,
          external_url: url,
        });
        toast("JSON data uploaded to IPFS", { type: "success" });
      } catch (error) {
        console.log("Error Uploading files on IPFS", error);
      }

      const nftMinter = new ethers.Contract(
        process.env.NEXT_PUBLIC_NFT_MINTER_ADDRESS,
        NFTMinter,
        library.getSigner(account)
      );
      nftMinter
        .connect(library.getSigner(account))
        .mint(account, ercTwoNum, ipfsHash)
        .then(
          (tx) => tx.wait() && toast("Successfully minted", { type: "success" })
        );
    }
  };

  return (
    <form
      className={classes.root}
      noValidate
      autoComplete="off"
      onSubmit={onSubmit}
    >
      {/* Left Container */}
      <div className={classes.uploadContainer}>
        <div style={{ margin: imgSrc ? "50px 0px" : "25% auto" }}>
          {imgSrc ? (
            <div>
              <img
                src={imgSrc}
                className={classes.previewImg}
                alt="preview-img"
              />
            </div>
          ) : (
            <img src="img/upload.svg" alt="upload" />
          )}
          {!imgSrc && (
            <React.Fragment>
              <Typography variant="h6" className={classes.uploadTitle}>
                Upload your file here
              </Typography>
              <Typography variant="h6" className={classes.uploadTitle2}>
                JPG, PNG, MP4, PDF or HTML videos accepted. 10MB limit.
              </Typography>
            </React.Fragment>
          )}
          <input
            accept="audio/*, video/*, image/*, .html, .pdf"
            id="upload-file"
            onChange={handleFile}
            type="file"
            hidden
          />
          <label htmlFor="upload-file">
            <Button component="span" className={classes.uploadBtn}>
              {file ? file.name : "Click to upload"}
            </Button>
          </label>
          {errors.file && (
            <Typography variant="h6" className={classes.errUpload}>
              {errors.file}
            </Typography>
          )}
        </div>
      </div>

      {/* Divider Line */}
      <div className={classes.divider}></div>

      {/* Right Side Container */}
      <div className={classes.rightContainer}>
        <div className={classes.formTitle}>
          <label className={classes.formTitleLabel}>Title</label>
          <input
            type="text"
            style={{
              border: errors.name ? "1px solid tomato" : "1px solid black",
            }}
            placeholder="Hall of Fame"
            className={classes.formGroupInput}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErr("");
              setErrors((pS) => ({ ...pS, name: "" }));
            }}
            onBlur={validateName}
            required
          />
          {errors.name && <p className={classes.error}>{errors.name}</p>}
        </div>
        <div className={classes.formTitle}>
          <label className={classes.formTitleLabel}>Description</label>
          <textarea
            type="text"
            style={{
              border: errors.desc ? "1px solid tomato" : "1px solid black",
            }}
            className={classes.formGroupInputDesc}
            value={description}
            placeholder="A description about your NFT"
            onChange={(e) => {
              setErrors((pS) => ({ ...pS, desc: "" }));
              setErr("");
              setDescription(e.target.value);
            }}
            onBlur={validateDescription}
            required
          ></textarea>
          {errors.desc && <p className={classes.error}>{errors.desc}</p>}
        </div>

        <div className={classes.formTitle}>
          <label className={classes.formTitleLabel}>
            Social Media URL (optional)
          </label>
          <input
            type="url"
            placeholder="https://twitter.com/example"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>

        <div className={classes.lastSec}>
          <div className={classes.note}>
            Once your MAToken NFT is minted on the Polygon blockchain, you will not be
            able to edit or update any of its information.
          </div>
          <Button
            type="submit"
            disabled={imgHash ? false : true}
            className={classes.submit}
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  uploadContainer: {
    width: "48%",
    height: 550,
    backgroundColor: "#F3F4F7",
    borderRadius: 20,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      height: "max-content",
    },
  },
  // uploadContainerCenter: {
  //   margin: '25% auto',
  //   [theme.breakpoints.down('md')]: {
  //     margin: 20,
  //   },
  // },
  previewImg: {
    maxWidth: 400,
    maxHeight: 400,
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  uploadTitle2: {
    maxWidth: 300,
    textAlign: "center",
    margin: "auto",
    fontSize: 16,
    fontWeight: 400,
  },
  uploadBtn: {
    maxWidth: 300,
    background: "#061024",
    padding: "10px 16px",
    fontSize: 16,
    color: "#FFFFFF",
    borderRadius: 37,
    margin: "20px auto",
    "&:hover": {
      background: "#061024",
    },
  },
  errUpload: {
    maxWidth: 300,
    textAlign: "center",
    margin: "auto",
    color: "tomato",
    fontSize: 16,
    fontWeight: 400,
  },
  // uploadBtnName: {
  //   overflow: 'hidden',
  //   textOverflow: 'ellipsis',
  //   whiteSpace: 'nowrap',
  // },

  divider: {
    border: "1px solid #DCDFE6",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },

  rightContainer: {
    width: "48%",
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  formTitle: {
    margin: "0 auto 1rem auto",
    padding: "0.25rem",
  },
  formTitleLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 10,
  },
  formGroupInput: {
    width: "100%",
    height: 54,
    fontSize: 16,
    padding: "0.3rem 0.75rem",
    border: "1px solid black",
    borderRadius: "0.25rem",
    outline: "none",
  },
  formGroupInputDesc: {
    resize: "none",
    width: "100%",
    height: 100,
    fontSize: 16,
    margin: 0,
    padding: "1.1rem 0.75rem",
    borderRadius: "0.25rem",
    outline: "none",
  },

  formType: {
    display: "flex",
    justifyContent: "space-between",
  },
  formTypeBtnGroup: {
    margin: 0,
    padding: 0,
  },
  btnGrp: {
    display: "flex",
    height: 52,
    justifyContent: "space-between",
    backgroundColor: "#F3F4F7",
    padding: 4,
    margin: "auto",
    borderRadius: 8,
  },
  formGroupFile: {
    display: "flex",
  },
  formTypeButton: {
    width: 102,
    height: 44,
    marginRight: 4,
    fontSize: 17,
    letterSpacing: "-0.01em",
    border: 0,
    color: "rgba(0, 0, 0, 0.26)",
    backgroundColor: "#F3F4F7",
    "&:hover": {
      backgroundColor: "#fffafa",
    },
    "&:disabled": {
      backgroundColor: "#FFFFFF",
      border: 0,
      color: "rgba(0, 0, 0, 1)",
      boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.08)",
    },
  },
  lastSec: {
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.down("md")]: {
      display: "block",
      margin: "30px 0",
    },
  },
  note: {
    color: "#6E798F",
    maxWidth: 370,
    margin: "auto 0",
    [theme.breakpoints.down("md")]: {
      margin: "auto",
      marginBottom: 20,
    },
  },
  submit: {
    background: "#15a64f",
    padding: "11px 30px",
    fontSize: 16,
    color: "#FFFFFF",
    borderRadius: 37,
    marginTop: 10,
    "&:hover": {
      background: "#018837",
    },
    "&:disabled": {
      background: "#70c290",
    },
  },
  error: {
    margin: "2px 0px",
    textAlign: "left",
    color: "tomato",
  },
}));

export default Form;
