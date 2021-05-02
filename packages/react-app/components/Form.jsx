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
  setOpen,
}) => {
  const { account, library } = useWeb3React();

  const classes = useStyles();

  // Hooks
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [surl, setSurl] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [imgHash, setImgHash] = useState("");
  const [musicHash, setMusicHash] = useState("");
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

  // Handle COVER file upload
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

   // Handle MUSIC file upload
   const handleMusicFile = async (event) => {
    if (event.target.files[0]?.size < 1e7) {
      setMusicFile(event.target.files[0]);

      const cid = await pinFileToIPFS(event.target.files[1]);
      toast("File uploaded to IPFS", { type: "success" });

      setMusicHash(cid);
      setErrors((prevErrors) => ({ ...prevErrors, file: "" }));

      if (event.target.files.length !== 0) {
       {/* DISPLAY AUDIO FILE PLAYER
        const reader = new FileReader();
        reader.onload = (event) => {
          setImgSrc(event.target.result);
        };
      reader.readAsDataURL(event.target.files[1]);
      */}
      }
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        musicFile: "File should be less than 100MB",
      }));
    }
  };
  
   // Handle MUSIC file upload
   const handleMusicFile2 = async (event) => {
    if (event.target.files[0]?.size < 1e7) {
      setMusicFile(event.target.files[0]);

      const cid = await pinFileToIPFS(event.target.files[1]);
      toast("File uploaded to IPFS", { type: "success" });

      setMusicHash(cid);
      setErrors((prevErrors) => ({ ...prevErrors, file: "" }));

      if (event.target.files.length !== 0) {
       {/* DISPLAY AUDIO FILE PLAYER
        const reader = new FileReader();
        reader.onload = (event) => {
          setImgSrc(event.target.result);
        };
      reader.readAsDataURL(event.target.files[1]);
      */}
      }
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        musicFile: "File should be less than 100MB",
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
        .mint(account, ercTwoNum, "0x" + Buffer.from(ipfsHash).toString("hex"))
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
      {/* *** Left Container *** */}

      {/* Cover Art */}
      <div className={classes.leftContainer}>
        <Typography variant="h6" className={classes.headerMain}>
                Cover Art
        </Typography>
        <div style={{ padding: imgSrc ? "50px 0px" : "10px 10px 10px 10px" }} className={classes.uploadContainer}>
        {imgSrc ? (
            <div>
            <img
              src={imgSrc}
              className={classes.previewImg}
              alt="preview-img"
            />
          </div>
        ) : (
          <img src="img/coverart.svg" alt="upload" />
        )}
          {!imgSrc && (
            <React.Fragment>
              <Typography variant="h6" className={classes.uploadTitle}>
                Upload a static album cover art / preview file
              </Typography>
              <Typography variant="h6" className={classes.uploadTitle2}>
                JPG or PNG accepted. 10MB limit. Square image. 1600px recommended.
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
              {file ? file.name : "Upload Static Art"}
            </Button>
          </label>
          {errors.file && (
            <Typography variant="h6" className={classes.errUpload}>
              {errors.file}
            </Typography>
          )}
        
          {!imgSrc && (
            <React.Fragment>
              <Typography variant="h6" className={classes.uploadTitle}>
               (optional - shown only when supported)
              </Typography>
              <Typography variant="h6" className={classes.uploadTitle}>
                Upload animated cover art / preview 
              </Typography>
              <Typography variant="h6" className={classes.uploadTitle2}>
                GIF, MP4, MOV or HTML videos accepted. 10MB limit. Square ratio.
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
              {file ? file.name : "Upload Animated Art"}
            </Button>
          </label>
          {errors.file && (
            <Typography variant="h6" className={classes.errUpload}>
              {errors.file}
            </Typography>
          )}
        </div>
        <Typography variant="h6" className={classes.headerMain}>
                Track Details
        </Typography>
        
        <div  className={classes.headerMain}>
        <select className={classes.formGroupInput}>
            <option value="Default">Select Album Type: (Default Basic Single)</option>
            <option value="Psy">Basic Single (1 Track)</option>
            <option value="Psy">Single (1 Track + Mixes/Edits/Remixes)</option>
            <option value="Funk">EP  (3-7 Tracks)</option>
            <option value="Reggae">LP  (7-10 Tracks)</option>
            <option value="House">Album (10+ Tracks)</option>
          </select>
          </div>

        {/* Music Upload 1 */}
        
        <div className={classes.musicupload}>
        
          <img src="img/musicfile.svg" alt="upload" />
      
        {(
            <React.Fragment>
              <Typography variant="h6" className={classes.uploadTitle}>
                 TRACK #1: Upload Music File
              </Typography>
              <Typography variant="h6" className={classes.uploadTitle2}>
                MP3, WAV, AIFF audio files accepted. 100MB limit.
              </Typography>
            </React.Fragment>
          )}

          <input
            accept="audio/*"
            id="upload-file-1"
            onChange={handleMusicFile}
            type="file"
            hidden
          />
          <label htmlFor="upload-file-1">
            <Button component="span" className={classes.uploadBtn}>
              {musicFile ? musicFile.name : "Track Details"}
            </Button>
          </label>
          <label htmlFor="upload-file-1">
            <Button component="span" className={classes.uploadBtn}>
              {musicFile ? musicFile.name : "Click to upload"}
            </Button>
          </label>
          {errors.musicFile && (
            <Typography variant="h6" className={classes.errUpload}>
              {errors.musicFile}
            </Typography>
          )}
        </div>

  
        {/* Bonus content */}
        <Typography variant="h6"className={classes.headerMain}>
                Bonus Content (optional)
        </Typography>


         <div className={classes.musicupload}>
            
          <img src="img/bonuscontent.svg" alt="upload" />
        {(
            <React.Fragment>
              <Typography variant="h6" className={classes.uploadTitle}>
                 Upload Bonus Content #1
              </Typography>
              <Typography variant="h6" className={classes.uploadTitle2}>
               JPG, PNG, TIFF, EPS, MP4, MP3, WAV, AIFF, PDF accepted. 100MB limit.
              </Typography>
            </React.Fragment>
          )}

          <input
            accept="audio/*"
            id="upload-file-1"
            onChange={handleMusicFile2}
            type="file"
            hidden
          />
                <div className={classes.formTitleHalf}>
          <label htmlFor="upload-file-2">
          <label className={classes.formTitleLabel}>
            Content Description
          </label>
          <textarea
            type="text"
            style={{
              border: errors.desc ? "1px solid tomato" : "1px solid black",
            }}
            className={classes.formGroupInputDesc}
            value={description}
            placeholder="A description about your Bonus Content"
            onChange={(e) => {
              setErrors((pS) => ({ ...pS, desc: "" }));
              setErr("");
              setDescription(e.target.value);
            }}
            onBlur={validateDescription}
            required
          ></textarea>
          </label></div>
          <label htmlFor="upload-file-1">
            <Button component="span" className={classes.uploadBtn}>
              {musicFile ? musicFile.name : "Upload Bonus Content"}
            </Button>
          </label>
          {errors.musicFile && (
            <Typography variant="h6" className={classes.errUpload}>
              {errors.musicFile}
            </Typography>
          )}
        </div>
        </div>
  
      {/* Divider Line */}
      <div className={classes.divider}></div>

      {/* *** Right Side Container *** */}
      <div className={classes.rightContainer}> <Typography variant="h6" className={classes.headerMain}>
                Album Details
        </Typography>
      <div className={classes.halfContainer}>
    

      <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>Artist Name</label>
          <input
            type="text"
            style={{
              border: errors.name ? "1px solid tomato" : "1px solid black",
            }}
            placeholder="The artist formerly known as Prince"
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
        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Artist URL
          </label>
          <input
            type="url"
            placeholder="http://www.bohemianyc.com"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>
        </div>
        <div className={classes.formTitle}>
          <label className={classes.formTitleLabel}>Album Title</label>
          <input
            type="text"
            style={{
              border: errors.name ? "1px solid tomato" : "1px solid black",
            }}
            placeholder="When Doves Fly"
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
          <label className={classes.formTitleLabel}>Album Description</label>
          <textarea
            type="text"
            style={{
              border: errors.desc ? "1px solid tomato" : "1px solid black",
            }}
            className={classes.formGroupInputDesc}
            value={description}
            placeholder="A description about your MAToken Album"
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
        <label className={classes.formTitleLabel}>Credits (Humans)</label>
          <textarea
            type="text"
            style={{
              border: "1px solid black",
            }}
            className={classes.formGroupInputDesc}
            value={description}
            placeholder="Vocals, Bass, Drums, Strings, Producer, Engineer, Recorded By, Songwriter"
            onChange={(e) => {
              setErrors((pS) => ({ ...pS, desc: "" }));
              setErr("");
              setDescription(e.target.value);
            }}
            onBlur={validateDescription}
            required
          ></textarea>
        </div>

        <div className={classes.halfContainer}>
        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Album Web / Discogs URL
          </label>
          <input
            type="url"
            placeholder="https://mylabelsite.com/example"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>

        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Release Date
          </label>
          <select className={classes.formGroupInput}>
            <option value="Default">Current Date/Time</option>
            <option value="Past">Past Release</option>
            <option value="Future">Future Release (N/A coming soon)</option>
          </select>
          
          <input
            type="url"
            placeholder="02-03-2018"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>

       
        </div>

        <div className={classes.halfContainer}>
        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Genre
          </label>

          <select className={classes.formGroupInput}>
            <option value="Default">Select Genre:</option>
            <option value="Rock">Rock</option>
            <option value="Electronic">Electronic</option>
            <option value="HipHop">HipHop</option>
            <option value="Custom">Custom</option>
          </select>
          
          <input
            type="url"
            placeholder="Enter Custom Genre"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>

        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Sub Genre
          </label>
          <select className={classes.formGroupInput}>
            <option value="Default">Select Sub Genre:</option>
            <option value="Psy">Psychadellic</option>
            <option value="Funk">Funk</option>
            <option value="Reggae">Reggae</option>
            <option value="House">House Music</option>
            <option value="Custom">Custom</option>
          </select>
          
          <input
            type="url"
            placeholder="Enter Custom Sub Genre"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>
        </div>

        <div className={classes.halfContainer}>
        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Catalog Number
          </label>
          <input
            type="url"
            placeholder="BYC002"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>

        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            UPC/EAN
          </label>
          <input
            type="url"
            placeholder="721762628393"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>
        </div>


        <div className={classes.halfContainer}>
        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Label Name
          </label>
          <input
            type="url"
            placeholder="Bohemian Yacht Club Music"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>

        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Label URL
          </label>
          <input
            type="url"
            placeholder="http://www.bohemianyc.com"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>
        </div>


        <div className={classes.halfContainer}>
        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
           Language
          </label>
          <select className={classes.formGroupInput}>
            <option value="Default">No Lyrics (Default)</option>
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
            <option value="Italian">Italian</option>
            <option value="Portuguese">Portuguese</option>
            <option value="German">German</option>
            <option value="Dutch">Dutch</option>
            <option value="Swedish">Swedish</option>
            <option value="Polish">Polish</option>
            <option value="Swedish">Greek</option>
            <option value="Hindi">Hindi</option>
            <option value="Bengali">Bengali</option>
            <option value="Punjabi">Punjabi</option>
            <option value="Hebrew">Hebrew</option>
            <option value="Arabic">Arabic</option>
            <option value="Turkish">Turkish</option>
            <option value="Rusian">Russian</option>
            <option value="Japanese">Japanese</option>
            <option value="Chinese">Chinese (Manderin)</option>
            <option value="Cantonese">Cantonese</option>
            <option value="Korean">Korean</option>
            <option value="Thai">Thai</option>
            <option value="Vietnamese">Vietnamese</option>
            <option value="Indonesian">Indonesian</option>
            <option value="Swahili">Swahili</option>
            <option value="Custom">Custom</option>
          </select>
          <input
            type="url"
            placeholder="English"
            className={classes.formGroupInput}
            value={url}
            pattern="https?://.+"
            onChange={(e) => setSurl(e.target.value)}
          />
        </div>

        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Content Rating
          </label>
          <select className={classes.formGroupInput}>
            <option value="Default">Choose Content Rating</option>
            <option value="C">C - Child Orientated Content</option>
            <option value="G">G - Suitable for All Ages</option>
            <option value="AA">AA - Recommended for 14+</option>
            <option value="PA">PA - Parental Advisory</option>
            <option value="X">X - Adults Only</option>
          </select>
          
        </div>
        </div>
{/*}
        <div className={classes.halfContainer}>
        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
           Release Region
          </label>
          <select className={classes.formGroupInput}>
            <option value="WW">WW - Worldwide (Default)</option>
            <option value="NA">NA - North America</option>
          </select>
        </div>

        <div className={classes.formTitleHalf}>
          <label className={classes.formTitleLabel}>
            Content Rating
          </label>
          <select className={classes.formGroupInput}>
            <option value="Default">Choose Content Rating</option>
            <option value="C">C - Child Orientated Content</option>
            <option value="G">G - Suitable for All Ages</option>
            <option value="AA">AA - Recommended for 14+</option>
            <option value="PA">PA - Parental Advisory</option>
            <option value="X">X - Adults Only</option>
          </select>
          
        </div>
        </div> */}
        <div className={classes.formTitle}>
        <label className={classes.formTitleLabel}>Company Credits</label>
          <textarea
            type="text"
            style={{
              border: "1px solid black",
            }}
            className={classes.formGroupInputDesc}
            value={description}
            placeholder="Published By, Recorded At, Distributed by, Copyright Info"
            onChange={(e) => {
              setErrors((pS) => ({ ...pS, desc: "" }));
              setErr("");
              setDescription(e.target.value);
            }}
            onBlur={validateDescription}
            required
          ></textarea>
        </div>
         
        <div className={classes.lastSec}>
          <div className={classes.note}>
            Once your MAToken NFT is minted on the Polygon blockchain, you will
            not be able to edit or update any of its information.
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
  leftContainer: {
    width: "48%",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      height: "max-content",
    },
  },
  uploadContainer: {
    backgroundColor: "#F3F4F7",
    borderRadius: 20,
    margin: "10px 0px 16px 00px",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      height: "max-content",
    },
  },
  musicupload: {
    width: "100%",
    backgroundColor: "#F3F4F7",
    margin: "10px auto",
    padding: "15px 0 0 0",
    height: "max-content",
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
  headerMain: {
    fontSize: 18,
    fontWeight: 500,
    background: "#dddddd",
    borderRadius: 12,
    marginBottom:10,
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
    background: "#606060",
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
  formTitleHalf: {
    width:"50%",
    margin: "0 auto 1rem auto",
    padding: "0.25rem",
  },
  halfContainer: {
    width:"100%",
    display: "flex",
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
