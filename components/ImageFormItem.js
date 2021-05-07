import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import ImageUpload from './ImageUpload';
import ImageLinkInput from './ImageLinkInput';
import Card from './Card';
import { FormError } from './FormItem';

const Divider = styled.span`
  display: block;
  margin: 10px 0;
  font-size: 14px;
`;

const ImagePreview = styled.img`
  width: 100%;
`;

const ImageFormItem = ({ onCorrectImage, error, onComponentResize }) => {
  const validImageMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  const [imageLink, setImageLink] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(undefined);

  useEffect(() => {
    onCorrectImage({ imageFile, previewSrc });
  }, [previewSrc]);

  const updateImage = useCallback((previewSrc, file) => {
    if (file) {
      setImageLink('');
      setImageFile(file);
    } else {
      setImageFile(null);
    }

    setPreviewSrc(previewSrc);
  }, []);

  return (
    <>
      <ImageLinkInput
        onChange={setImageLink}
        onCorrectImage={updateImage}
        onError={onComponentResize}
        style={{ marginBottom: 4 }}
        placeholder="Paste image link"
        value={imageLink}
      />
      <Divider>-or-</Divider>
      <ImageUpload
        onImageChange={updateImage}
        validImageMimeTypes={validImageMimeTypes}
        onError={onComponentResize}
        text="Select your image (max 10 MB)"
        style={{ marginBottom: 4 }}
      />
      {error && <FormError>{error}</FormError>}
      {previewSrc && (
        <Card style={{ marginTop: 20 }} noPadding>
          <ImagePreview className="img-fluid" src={previewSrc} onLoad={onComponentResize} />
        </Card>
      )}
    </>
  );
};

ImageFormItem.propTypes = {
  error: PropTypes.string,
  onCorrectImage: PropTypes.func.isRequired,
  onImageLoad: PropTypes.func,
  onComponentResize: PropTypes.func,
};

export default ImageFormItem;
