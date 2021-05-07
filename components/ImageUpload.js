import { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import FormItem from './FormItem';
import { IMAGE_CONFIG } from '../utils/constants';

const ImageUpload = ({ onImageChange, validImageMimeTypes, onError, text, style, minWidthSize }) => {
  const [inputError, setInputError] = useState(null);
  const [fileName, setFileName] = useState(null);

  useEffect(() => {
    onImageChange(null, null);
    setFileName(null);
    if (onError !== null) onError();
  }, [inputError]);

  const preview = (image) => {
    const reader = new FileReader();
    reader.onload = () => onImageChange(reader.result, image);
    reader.readAsDataURL(image);
  };

  const handleImageChange = (event) => {
    const [file] = event.target.files;
    if (!file) {
      return;
    }
    setInputError(null);

    if (file.size > IMAGE_CONFIG.MAX_UPLOAD_SIZE) {
      setInputError('Image size must not exceed 10 MB');
      return;
    }

    if (!validImageMimeTypes.includes(file.type)) {
      setInputError('Invalid image type');
      return;
    }

    let image = new Image();
    const imageObjectUrl = URL.createObjectURL(file);
    image.onload = function() {
      const { width, height } = this;

      if (width < minWidthSize) {
        setInputError(`Image width must be at least ${minWidthSize}px`);
        return;
      }

      if (height > width * 3) {
        setInputError('Image height must not exceed its width by more than three times');
        return;
      }

      setFileName(file.name);
      preview(file);
      URL.revokeObjectURL(imageObjectUrl);
    };
    image.src = imageObjectUrl;
  };

  return (
    <FormItem
      key="imageFile"
      isFileInput
      id="image"
      type="file"
      name="image"
      accept="image"
      onChange={handleImageChange}
      label={fileName || text}
      errorText={inputError}
      style={style}
    />
  );
};

ImageUpload.propTypes = {
  onImageChange: PropTypes.func.isRequired,
  validImageMimeTypes: PropTypes.array.isRequired,
  onError: PropTypes.func,
  text: PropTypes.string,
  style: PropTypes.object,
  minWidthSize: PropTypes.number,
};

ImageUpload.defaultProps = {
  onError: null,
  text: 'Select image',
  style: {},
  minWidthSize: IMAGE_CONFIG.MIN_UPLOAD_WIDTH,
};

export default memo(ImageUpload);
