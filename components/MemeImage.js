import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import styled from 'styled-components';
import config from '../config';
import { parseJson } from '../utils/common';
import { IMAGE_TYPES } from '../utils/constants';

const PlayButtonBackground = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 150px;
  margin-top: -75px;
  margin-left: -75px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 75px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.75);
  }
`;

const PlayButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -30px;
  margin-left: -24px;
  width: 0;
  height: 0;
  border-width: 30px 0 30px 60px;
  border-color: transparent transparent transparent rgba(255, 255, 255, 0.8);
  background-color: transparent;
  padding: 0;
  &:focus {
    outline: none;
  }
`;

const AnimatedImageContainer = styled.div`
  position: relative;
`;

const MemeImage = ({ meme, type, className, isPlaceholderActive }) => {
  const { imageSet, filename, extension, link, title, isAnimated } = meme;
  const [showPlaceholder, setShowPlaceholder] = useState(isPlaceholderActive);

  let responsiveLinks = null;

  if (imageSet) {
    const srcSet = parseJson(imageSet);
    if (srcSet) {
      responsiveLinks = [
        srcSet[type]?.size3x ? `${config.storageUrl}${srcSet[type].size3x}` : '',
        srcSet[type]?.size2x ? `${config.storageUrl}${srcSet[type].size2x}` : '',
      ]
        .filter((element) => element !== '')
        .join(', ');
    }
  }

  if (isAnimated) {
    return (
      <AnimatedImageContainer>
        <img
          className={className}
          style={{ marginBottom: 0 }}
          alt={title}
          src={
            showPlaceholder
              ? `${config.storageUrl}/${filename}-${IMAGE_TYPES.PLACEHOLDER_FRAME.NAME}.${extension}`
              : `${config.storageUrl}/${filename}.${extension}`
          }
        />
        {showPlaceholder && (
          <PlayButtonBackground
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setShowPlaceholder(false);
            }}
          >
            <PlayButton />
          </PlayButtonBackground>
        )}
      </AnimatedImageContainer>
    );
  }

  const imageLink = filename ? `${config.storageUrl}/${filename}-${type}.${extension}` : link;

  return (
    <LazyLoadImage
      className={className}
      alt={title}
      placeholder={<div style={{ width: '300px', minHeight: '450px' }}></div>}
      src={imageLink}
      srcSet={responsiveLinks}
      threshold={300}
    />
  );
};

MemeImage.propTypes = {
  meme: PropTypes.object.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  isPlaceholderActive: PropTypes.bool,
};

MemeImage.defaultProps = {
  type: IMAGE_TYPES.FULL.NAME,
  className: null,
  isPlaceholderActive: true,
};

export default memo(MemeImage);
