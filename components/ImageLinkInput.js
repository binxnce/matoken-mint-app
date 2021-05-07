import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import FormItem from './FormItem';

const ImageLinkInput = (props) => {
  const [inputError, setInputError] = useState(undefined);

  useEffect(() => {
    if (props.onError) props.onError();
  }, [inputError]);

  const isImageLink = (src) => {
    const image = new Image();

    const promise = new Promise((resolve, reject) => {
      image.onerror = reject;
      image.onload = resolve;
    });
    image.src = src;
    return promise;
  };

  const onImageLinkChange = (event) => {
    setInputError(undefined);
    const imageLink = event.target.value;
    props.onChange(imageLink);
    isImageLink(imageLink)
      .then(() => {
        props.onCorrectImage(imageLink);
      })
      .catch((e) => {
        console.error(e);
        setInputError('Invalid image link');
      });
  };

  return (
    <FormItem
      key="imageLink"
      type="text"
      id="imageLink"
      name="imageLink"
      placeholder={props.placeholder}
      onChange={onImageLinkChange}
      errorText={inputError}
      style={props.style}
      value={props.value}
    />
  );
};

ImageLinkInput.propTypes = {
  onCorrectImage: PropTypes.func,
  style: PropTypes.object,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onError: PropTypes.func,
  value: PropTypes.string,
};

export default ImageLinkInput;
