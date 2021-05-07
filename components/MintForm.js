import React, { useState } from 'react';

import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { pinJSONToIPFS, pinFileToIPFS } from '../utils/ipfs';

toast.configure();

const Form = () => {
  // Left Column Hooks
  const [file, setFile] = useState(null); // image file name
  const [imgHash, setImgHash] = useState(''); // image file hash
  const [imgSrc, setImgSrc] = useState(''); // image file source
  const [musicFile, setMusicFile] = useState(null); // music file name
  const [musicHash, setMusicHash] = useState(''); // music file hash
  const [bonusFile, setBonusFile] = useState(null); // bonus file name
  const [bonusHash, setBonusHash] = useState(''); // bonus file hash

  // Album Info Hooks
  const [name, setAName] = useState(''); // artist name
  const [aurl, setAurl] = useState(''); // artist url
  const [title, setTitle] = useState(''); // album title
  const [description, setDescription] = useState(''); // album description
  const [credits, setCredits] = useState(''); // album human credits
  const [companyCredits, setCompanyCredits] = useState(''); // album company credits
  const [genre, setGenre] = useState(''); // album genre
  const [subgenre, setSubGenre] = useState(''); // album subgenre
  const [catalogNum, setCatalogNum] = useState(''); // album catalog number
  const [upcean, setUPCEAN] = useState(''); // album UPC / EAN

  // Economic Detail Hooks
  const [initialPrice, setInitialPrice] = useState(''); // Intitial Sale Price
  const [initialCopies, setInitialCopies] = useState(''); // Intitial Copies
  const [onHoldPool, setOnHoldPool] = useState(''); // On Hold In Pool
  const [maxCopiesCustomer, setMaxCopiesCustomer] = useState(''); // Max Copies per Customer
  const [maxCopiesReseller, setMaxCopiesReseller] = useState(''); // Max Copies per Reseller
  const [payoutAPercent, setAPercent] = useState(''); // Payout - Artist Percentage
  const [payoutAAddress, setAAddress] = useState(''); // Payout - Artist Payout Address (hash)

  // Clear Error Handling Hooks
  const [errors, setErrors] = useState({
    name: '',
    desc: '',
    file: '',
  });

  // Validate form fields
  const validateName = () => {
    if (name === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: 'Required',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, name: '' }));
    }
  };
  const validateTitle = () => {
    if (title === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        title: 'Required',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, title: '' }));
    }
  };
  const validateDescription = () => {
    if (description === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        desc: 'Add description for your token - Required',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, desc: '' }));
    }
  };
  const validateInitialPrice = () => {
    if (initialPrice === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        initialPrice: 'Required',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, initialPrice: '' }));
    }
  };
  const validateInitialCopies = () => {
    if (initialCopies === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        initialCopies: 'Required',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, initialCopies: '' }));
    }
  };
  const validateOnHoldPool = () => {
    if (onHoldPool === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        onHoldPool: 'Required',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, onHoldPool: '' }));
    }
  };

  // Handle COVER file upload
  const handleFile = async (event) => {
    if (event.target.files[0]?.size < 1e7) {
      setFile(event.target.files[0]);

      // Send file to IPFS Storage
      const cid = await pinFileToIPFS(event.target.files[0]);
      toast('File uploaded to IPFS', { type: 'success' });

      setImgHash(cid);
      setErrors((prevErrors) => ({ ...prevErrors, file: '' }));

      if (event.target.files.length !== 0) {
        // Display Image Preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setImgSrc(event.target.result);
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        file: 'File should be less than 10MB',
      }));
    }
  };

  // Handle MUSIC file upload
  const handleMusicFile = async (event) => {
    if (event.target.files[0]?.size < 1e7) {
      setMusicFile(event.target.files[0]);

      // Check if file is correct format

      // Send file to IPFS Storage
      const cid = await pinFileToIPFS(event.target.files[0]);
      toast('File uploaded to IPFS', { type: 'success' });

      setMusicHash(cid);
      setErrors((prevErrors) => ({ ...prevErrors, file: '' }));

      if (event.target.files.length !== 0) {
        {
          /* DISPLAY AUDIO FILE PLAYER
            const reader = new FileReader();
            reader.onload = (event) => {
              setImgSrc(event.target.result);
            };
            reader.readAsDataURL(event.target.files[1]);
          */
        }
      }
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        musicFile: 'File should be less than 100MB',
      }));
    }
  };

  // Handle BONUS file upload
  const handleBonusFile = async (event) => {
    if (event.target.files[0]?.size < 1e7) {
      setBonusFile(event.target.files[0]);

      const cid = await pinFileToIPFS(event.target.files[1]);
      toast('File uploaded to IPFS', { type: 'success' });

      setBonusHash(cid);
      setErrors((prevErrors) => ({ ...prevErrors, file: '' }));

      if (event.target.files.length !== 0) {
        {
          /* DISPLAY AUDIO FILE PLAYER
            const reader = new FileReader();
            reader.onload = (event) => {
              setImgSrc(event.target.result);
            };
            reader.readAsDataURL(event.target.files[1]);
          */
        }
      }
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        bonusFile: 'File should be less than 100MB',
      }));
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    validateName();
    validateTitle();
    validateDescription();
    validateInitialPrice();
    validateInitialCopies();
    validateOnHoldPool();

    if (name && description && file && imgHash) {
      // Upload JSON to IPFS
      let ipfsHash = '';
      try {
        ipfsHash = await pinJSONToIPFS({
          description: description,
          external_url: aurl,
          image: 'https://gateway.pinata.cloud/ipfs/' + imgHash,
          name: name + ' - ' + title,
          attributes: [
            {
              trait_type: 'numtracks',
              value: 1,
            },
            {
              trait_type: 'artistname',
              value: name,
            },
            {
              trait_type: 'genre',
              value: genre,
            },
            {
              trait_type: 'subgenre',
              value: subgenre,
            },
            {
              trait_type: 'releasedate',
              value: 1,
            },
            {
              trait_type: 'UPC',
              value: upcean,
            },
            {
              trait_type: 'catalognumber',
              value: catalogNum,
            },
            {
              trait_type: 'albumtype',
              value: 'Single',
            },
          ],
          album_title: title,
          artist_name: name,
          album_desc: description,
          album_credits: credits,
          album_companyCredits: companyCredits,
          album_genre: genre,
          album_subgenre: subgenre,
          album_catalogNum: catalogNum,
          album_UPCEAN: upcean,
          track1: musicHash ? 'https://gateway.pinata.cloud/ipfs/' + musicHash : '',
          bonus: bonusHash ? 'https://gateway.pinata.cloud/ipfs/' + bonusHash : '',
        });
        toast('JSON data uploaded to IPFS', { type: 'success' });
      } catch (error) {
        // eslint-disable-next-line
        console.log('Error Uploading files on IPFS', error);
      }

      // TODO: ???
      // // Run Minting Process
      // const nftMinter = new ethers.Contract(
      //   process.env.NEXT_PUBLIC_NFT_MINTER_ADDRESS,
      //   NFTMinter,
      //   library.getSigner(account),
      // );
      // nftMinter
      //   .connect(library.getSigner(account))
      //   .mint(account, initialCopies + onHoldPool, '0x' + Buffer.from(ipfsHash).toString('hex'))
      //   .then((tx) => tx.wait() && toast('Successfully minted', { type: 'success' }));
    }
  };

  return (
    <form className={classes.root} noValidate autoComplete="off" onSubmit={onSubmit}>
      {/* *** Left Container *** */}

      {/* Cover Art */}
      <div className={classes.leftContainer}>
        <h6 className={classes.headerMain}>Cover Art</h6>
        <div style={{ padding: imgSrc ? '50px 0px' : '10px 10px 10px 10px' }} className={classes.uploadContainer}>
          {imgSrc ? (
            <div>
              <img src={imgSrc} className={classes.previewImg} alt="preview-img" />
            </div>
          ) : (
            <img src="img/coverart.svg" alt="upload" />
          )}
          {!imgSrc && (
            <React.Fragment>
              <h6 className={classes.uploadTitle}>Upload a static album cover art / preview file *</h6>
              <h6 className={classes.uploadTitle2}>
                JPG, GIF, MP4, MOV, PNG or HTML videos accepted. 10MB limit. Square image. 1600px recommended.
              </h6>
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
            <button component="span" className={classes.uploadBtn}>
              {file ? file.name : 'Upload Art'}
            </button>
          </label>
          {errors.file && <h6 className={classes.errUpload}>{errors.file}</h6>}
        </div>
        <h6 className={classes.headerMain}>Track Details</h6>

        <div className={classes.headerMain}>
          <select className={classes.formGroupInput}>
            <option value="Default">Select Album Type: (Default Basic Single)</option>
          </select>
        </div>

        {/* Music Upload 1 */}

        <div className={classes.musicupload}>
          <img src="img/musicfile.svg" alt="upload" />

          {
            <React.Fragment>
              <h6 className={classes.uploadTitle}>TRACK #1: Upload Music File *</h6>
              <h6 className={classes.uploadTitle2}>MP3, WAV, AIFF audio files accepted. 10MB limit.</h6>
            </React.Fragment>
          }

          <input accept="audio/*" id="upload-file-1" onChange={handleMusicFile} type="file" hidden />
          <label htmlFor="upload-file-2">
            <button component="span" className={classes.uploadBtn}>
              {'Track Details'}
            </button>
          </label>
          <label htmlFor="upload-file-1">
            <button component="span" className={classes.uploadBtn}>
              {musicFile ? musicFile.name : 'Click to upload'}
            </button>
          </label>
          {errors.musicFile && <h6 className={classes.errUpload}>{errors.musicFile}</h6>}
        </div>

        {/* Bonus content */}
        <h6 className={classes.headerMain}>Bonus Content</h6>

        <div className={classes.musicupload}>
          <img src="img/bonuscontent.svg" alt="upload" />
          {
            <React.Fragment>
              <h6 className={classes.uploadTitle}>(optional) Upload Bonus Content #1</h6>
              <h6 className={classes.uploadTitle2}>
                JPG, PNG, TIFF, EPS, MP4, MP3, WAV, AIFF, PDF accepted. 10MB limit.
              </h6>
            </React.Fragment>
          }

          <input
            accept="audio/*, video/*, image/*, .html, .pdf"
            id="upload-bonus"
            onChange={handleBonusFile}
            type="file"
            hidden
          />

          <label htmlFor="upload-bonus">
            <button component="span" className={classes.uploadBtn}>
              {bonusFile ? bonusFile.name : 'Upload Bonus Content'}
            </button>
          </label>
          {errors.bonusFile && <h6 className={classes.errUpload}>{errors.bonusFile}</h6>}
        </div>
      </div>

      {/* Divider Line */}
      <div className={classes.divider}></div>

      {/* *** Right Side Container *** */}
      <div className={classes.rightContainer}>
        {' '}
        <h6 className={classes.headerMain}>Album Details</h6>
        <div className={classes.halfContainer}>
          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Artist Name *</label>
            <input
              type="text"
              style={{
                border: errors.name ? '1px solid tomato' : '1px solid black',
              }}
              placeholder="The artist formerly known as Prince"
              className={classes.formGroupInput}
              value={name}
              onChange={(e) => {
                setAName(e.target.value);
                setErrors((pS) => ({ ...pS, name: '' }));
              }}
              onBlur={validateName}
              required
            />
            {errors.name && <p className={classes.error}>{errors.name}</p>}
          </div>

          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Artist URL</label>
            <input
              type="url"
              placeholder="http://www.bohemianyc.com"
              className={classes.formGroupInput}
              value={aurl}
              pattern="https?://.+"
              onChange={(e) => setAurl(e.target.value)}
            />
          </div>
        </div>
        <div className={classes.formTitle}>
          <label className={classes.formTitleLabel}>Album Title *</label>
          <input
            type="text"
            style={{
              border: errors.title ? '1px solid tomato' : '1px solid black',
            }}
            placeholder="When Doves Fly"
            className={classes.formGroupInput}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((pS) => ({ ...pS, title: '' }));
            }}
            onBlur={validateTitle}
            required
          />
          {errors.title && <p className={classes.error}>{errors.title}</p>}
        </div>
        <div className={classes.formTitle}>
          <label className={classes.formTitleLabel}>Album Description *</label>
          <textarea
            type="text"
            style={{
              border: errors.desc ? '1px solid tomato' : '1px solid black',
            }}
            className={classes.formGroupInputDesc}
            value={description}
            placeholder="A description about your MAToken Album"
            onChange={(e) => {
              setDescription((pS) => ({ ...pS, desc: '' }));
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
              border: '1px solid black',
            }}
            className={classes.formGroupInputDesc}
            value={credits}
            placeholder="Vocals, Bass, Drums, Strings, Producer, Engineer, Recorded By, Songwriter"
            onChange={(e) => {
              setErrors((pS) => ({ ...pS, credits: '' }));
              setCredits(e.target.value);
            }}
          ></textarea>
        </div>
        <div className={classes.formTitle}>
          <label className={classes.formTitleLabel}>Company Credits</label>
          <textarea
            type="text"
            style={{
              border: '1px solid black',
            }}
            className={classes.formGroupInputDesc}
            value={companyCredits}
            placeholder="Published By, Recorded At, Distributed by, Copyright Info"
            onChange={(e) => {
              setErrors((pS) => ({ ...pS, companyCredits: '' }));
              setCompanyCredits(e.target.value);
            }}
          ></textarea>
        </div>
        <div className={classes.halfContainer}>
          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Genre *</label>

            <select
              className={classes.formGroupInput}
              onChange={(e) => {
                setErrors((pS) => ({ ...pS, genre: '' }));
                setGenre(e.target.value);
              }}
            >
              <option value="">Select Genre:</option>
              <option value="1">Pop</option>
              <option value="2">Rock</option>
              <option value="3">Metal / Heavy</option>
              <option value="4">Electronic</option>
              <option value="5">Underground Electronic</option>
              <option value="6">Chillout/Ambient</option>
              <option value="7">HipHop/Rap</option>
              <option value="8">Funk / Disco</option>
              <option value="9">R + B / Soul</option>
              <option value="10">Reggae</option>
              <option value="11">Latin</option>
              <option value="12">Country</option>
              <option value="13">Classical</option>
              <option value="14">Folk/Regional</option>
              <option value="15">Jazz</option>
              <option value="16">Faith / Religous Music</option>
              <option value="17">Acoustic / Instrumental</option>
              <option value="18">Experimental</option>
              <option value="19">Spoken Word / Vocal Only</option>
              <option value="20">Samples / Sounds / Utility</option>
              <option value="999">Custom</option>
            </select>
          </div>

          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Sub Genre</label>
            <select
              className={classes.formGroupInput}
              onChange={(e) => {
                setErrors((pS) => ({ ...pS, subgenre: '' }));
                setSubGenre(e.target.value);
              }}
            >
              <option value="">Select Sub Genre: (Default None)</option>
              <option value="1">dance pop</option>
              <option value="2">pop rap</option>
              <option value="3">Reggae</option>
              <option value="4">southern hip hop</option>
              <option value="5">alternative rock</option>
              <option value="6">alternative metal</option>
              <option value="7">classic rock</option>
              <option value="8">psychadellic rock</option>
              <option value="9">latin pop</option>
              <option value="10">techno</option>
              <option value="11">trance</option>
              <option value="12">electro house</option>
              <option value="13">progressive house</option>
              <option value="14">deep house</option>
              <option value="15">synthpop</option>
              <option value="16">reggaeton flow</option>
              <option value="17">lo-fi</option>
              <option value="18">christian rock</option>
              <option value="99999">custom</option>
            </select>
          </div>
        </div>
        <div className={classes.halfContainer}>
          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Catalog Number</label>
            <input
              type="text"
              placeholder="BYC002"
              className={classes.formGroupInput}
              value={catalogNum}
              onChange={(e) => setCatalogNum(e.target.value)}
            />
          </div>

          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>UPC/EAN</label>
            <input
              type="text"
              placeholder="721762628393"
              className={classes.formGroupInput}
              value={upcean}
              onChange={(e) => setUPCEAN(e.target.value)}
            />
          </div>
        </div>
        <h6 className={classes.headerMain}>Economic Details</h6>
        <div className={classes.halfContainer}>
          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Initial Sale Price *</label>
            <input
              type="text"
              placeholder="$5"
              style={{
                border: errors.initialPrice ? '1px solid tomato' : '1px solid black',
              }}
              className={classes.formGroupInput}
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
              onBlur={validateInitialPrice}
              required
            />
            {errors.initialPrice && <p className={classes.error}>{errors.initialPrice}</p>}
          </div>

          <div className={classes.halfContainer}>
            <div className={classes.formTitleHalf}>
              <label className={classes.formTitleLabel}>Initial Copies *</label>
              <input
                type="text"
                placeholder="1000"
                style={{
                  border: errors.initialCopies ? '1px solid tomato' : '1px solid black',
                }}
                className={classes.formGroupInput}
                value={initialCopies}
                onChange={(e) => setInitialCopies(e.target.value)}
                onBlur={validateInitialCopies}
                required
              />
              {errors.initialCopies && <p className={classes.error}>{errors.initialCopies}</p>}
            </div>

            <div className={classes.formTitleHalf}>
              <label className={classes.formTitleLabel}>On Hold in Pool *</label>
              <input
                type="text"
                placeholder="1000"
                style={{
                  border: errors.onHoldPool ? '1px solid tomato' : '1px solid black',
                }}
                className={classes.formGroupInput}
                value={onHoldPool}
                onChange={(e) => setOnHoldPool(e.target.value)}
                onBlur={validateOnHoldPool}
                required
              />
              {errors.onHoldPool && <p className={classes.error}>{errors.onHoldPool}</p>}
            </div>
          </div>
        </div>
        <div className={classes.halfContainer}>
          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Max Copies per Customer</label>
            <input
              type="text"
              placeholder="5"
              className={classes.formGroupInput}
              value={maxCopiesCustomer}
              onChange={(e) => setMaxCopiesCustomer(e.target.value)}
            />
          </div>

          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Max Copies per Reseller</label>
            <input
              type="text"
              placeholder="100"
              className={classes.formGroupInput}
              value={maxCopiesReseller}
              onChange={(e) => setMaxCopiesReseller(e.target.value)}
            />
          </div>
        </div>
        <label className={classes.formTitleLabel}>Payout Info</label>
        <select className={classes.formGroupInput}>
          <option value="Default">Select Payout Parties: (Default Artist Only)</option>
          <option value="Psy">Artist Only</option>
        </select>
        <div className={classes.halfContainer}>
          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Artist Payout Percentage</label>
            <input
              type="text"
              placeholder="100%"
              className={classes.formGroupInput}
              value={payoutAPercent}
              onChange={(e) => setAPercent(e.target.value)}
            />
          </div>

          <div className={classes.formTitleHalf}>
            <label className={classes.formTitleLabel}>Artist Payout Address</label>
            <input
              type="text"
              placeholder="eth address 0xe3rw..."
              className={classes.formGroupInput}
              value={payoutAAddress}
              onChange={(e) => setAAddress(e.target.value)}
            />
          </div>
        </div>
        <div className={classes.lastSec}>
          <div className={classes.note}>
            Once your MAToken NFT is minted on the Polygon blockchain, you will not be able to edit or update any of its
            information.
          </div>
          <button type="submit" disabled={imgHash ? false : true} className={classes.submit}>
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

const classes = {
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  leftContainer: {
    width: '48%',
  },
  uploadContainer: {
    backgroundColor: '#F3F4F7',
    borderRadius: 20,
    margin: '10px 0px 16px 00px',
  },
  musicupload: {
    width: '100%',
    backgroundColor: '#F3F4F7',
    margin: '10px auto',
    padding: '15px 0 0 0',
    height: 'max-content',
    borderRadius: 20,
  },
  previewImg: {
    maxWidth: 400,
    maxHeight: 400,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  headerMain: {
    fontSize: 18,
    fontWeight: 500,
    background: '#dddddd',
    borderRadius: 12,
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  uploadTitle2: {
    maxWidth: 300,
    textAlign: 'center',
    margin: 'auto',
    fontSize: 16,
    fontWeight: 400,
  },
  uploadBtn: {
    maxWidth: 300,
    background: '#606060',
    padding: '10px 16px',
    fontSize: 16,
    color: '#FFFFFF',
    borderRadius: 37,
    margin: '20px auto',
    '&:hover': {
      background: '#061024',
    },
  },
  errUpload: {
    maxWidth: 300,
    textAlign: 'center',
    margin: 'auto',
    color: 'tomato',
    fontSize: 16,
    fontWeight: 400,
  },

  divider: {
    border: '1px solid #DCDFE6',
  },

  rightContainer: {
    width: '48%',
  },
  formTitle: {
    margin: '0 auto 1rem auto',
    padding: '0.25rem',
  },
  formTitleHalf: {
    width: '50%',
    margin: '0 auto 1rem auto',
    padding: '0.25rem',
  },
  halfContainer: {
    width: '100%',
    display: 'flex',
  },
  formTitleLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 10,
  },
  formGroupInput: {
    width: '100%',
    height: 54,
    fontSize: 16,
    padding: '0.3rem 0.75rem',
    border: '1px solid black',
    borderRadius: '0.25rem',
    outline: 'none',
  },
  formGroupInputDesc: {
    resize: 'none',
    width: '100%',
    height: 100,
    fontSize: 16,
    margin: 0,
    padding: '1.1rem 0.75rem',
    borderRadius: '0.25rem',
    outline: 'none',
  },

  formType: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  formTypeBtnGroup: {
    margin: 0,
    padding: 0,
  },
  btnGrp: {
    display: 'flex',
    height: 52,
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F7',
    padding: 4,
    margin: 'auto',
    borderRadius: 8,
  },
  formGroupFile: {
    display: 'flex',
  },
  formTypeButton: {
    width: 102,
    height: 44,
    marginRight: 4,
    fontSize: 17,
    letterSpacing: '-0.01em',
    border: 0,
    color: 'rgba(0, 0, 0, 0.26)',
    backgroundColor: '#F3F4F7',
    '&:hover': {
      backgroundColor: '#fffafa',
    },
    '&:disabled': {
      backgroundColor: '#FFFFFF',
      border: 0,
      color: 'rgba(0, 0, 0, 1)',
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
    },
  },
  lastSec: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  note: {
    color: '#6E798F',
    maxWidth: 370,
    margin: 'auto 0',
  },
  submit: {
    background: '#15a64f',
    padding: '11px 30px',
    fontSize: 16,
    color: '#FFFFFF',
    borderRadius: 37,
    marginTop: 10,
    '&:hover': {
      background: '#018837',
    },
    '&:disabled': {
      background: '#70c290',
    },
  },
  error: {
    margin: '2px 0px',
    textAlign: 'left',
    color: 'tomato',
  },
};

export default Form;
