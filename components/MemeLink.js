import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/router';

// NOTE: will work only on pages with <MemeModalHandler /> or other way
// of displaying the meme passed in 'memePopup' query parameter

const MemeLink = ({ memeId, ...linkProps }) => {
  const { pathname, query } = useRouter();

  const href = {
    pathname,
    query: pathname === '/meme/[id]' ? { ...query, id: memeId } : { ...query, memePopup: memeId },
  };

  return <Link href={href} as={`/meme/${memeId}`} {...linkProps} />;
};

MemeLink.propTypes = {
  memeId: PropTypes.string.isRequired,
};

export default MemeLink;
