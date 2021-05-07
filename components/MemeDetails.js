import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Image, Badge } from 'react-bootstrap';
import moment from 'moment';
import Link from 'next/link';
import config from '../config';

import { getShortAddress } from '../utils/ui';
import { fontSize, fontWeight } from '../utils/variables';
import { buildAvatarUrl } from '../utils/common';

import Card from './Card';
import MemeHistory from './MemeHistory';
import BigCloseButton from './BigCloseButton';
import { LinkButton } from './Button';

const fbShare = (id) => {
  FB.ui({
    display: 'popup',
    method: 'share',
    href: `${config.webUrl}/meme/${id}`,
  });
};

const Body = styled.div`
  display: grid;
  grid-template:
    'close created artist' auto
    '.     title   share' auto
    '.     details details' auto
    / 1fr 3fr auto;
  grid-gap: 1em;
`;

const Created = styled.div`
  grid-area: created;
  font-size: ${fontSize.xxs};
  font-weight: ${fontWeight.regular};
`;

const Artist = styled.div`
  grid-area: artist;
  display: flex;
  font-size: ${fontSize.xxs};
  font-weight: ${fontWeight.regular};
`;

const Title = styled.h1`
  grid-area: title;
  font-size: ${fontSize.xxl};
`;

const ShareButton = styled(LinkButton)`
  grid-area: share;
  align-self: start;
  justify-self: start;
  font-size: ${fontSize.m};
  font-weight: ${fontWeight.regular};

  && {
    padding-left: 0;
  }

  i {
    margin-right: 10px;
  }
`;

const Details = styled.div`
  grid-area: details;
  padding-right: 45px;
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.regular};

  & > * {
    margin-bottom: 40px;
  }
`;

const AVATAR_SIZE = '3em';

const Avatar = styled(Image)`
  width: ${AVATAR_SIZE};
  height: ${AVATAR_SIZE};
  margin-left: 1em;
`;

const ArtistInfo = ({ artist }) => (
  <Artist>
    <div className="d-flex">
      <div>
        <p>Artist</p>
        <p>
          <Link href="#">{getShortAddress(artist.address)}</Link>
        </p>
      </div>
      <Avatar src={buildAvatarUrl(artist.avatar)} roundedCircle />
    </div>
  </Artist>
);

ArtistInfo.propTypes = {
  artist: PropTypes.shape({
    address: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      link: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const CategoryPill = styled((props) => <Badge pill {...props} />)`
  border: 1px solid #ababab;
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.medium};
  padding: 8px 20px;
`;

const CategoryLink = ({ category }) => (
  <Link
    href={{
      pathname: '/category/[id]',
      query: { id: category },
    }}
  >
    <a>
      <CategoryPill>{category}</CategoryPill>
    </a>
  </Link>
);

CategoryLink.propTypes = {
  category: PropTypes.string.isRequired,
};

const TagsContainer = styled.p`
  font-size: ${fontSize.m};
`;

const Tags = ({ tags }) =>
  tags &&
  tags.length > 0 && (
    <TagsContainer>
      Tags:{' '}
      {tags.map((tag, index) => (
        <span key={tag}>
          {index > 0 && ', '}
          <Link href="#">{`#${tag}`}</Link>
        </span>
      ))}
    </TagsContainer>
  );

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
};

const Description = styled.div`
  div {
    margin: 0;
    padding: 0;
  }
`;

const MemeDetails = ({ meme, onClose }) => {
  // placeholders
  // const extra = { label: 'Rare item', link: '/?q=rare' };

  return (
    <Card>
      <Body>
        <BigCloseButton onClick={onClose} />
        <Created>
          <p>Created {moment(meme.createdAt).fromNow()}</p>
          <p>{/* extra && <Link href={extra.link}><a>{extra.label}</a></Link> */}</p>
        </Created>
        {!!meme.owner && <ArtistInfo artist={meme.owner} />}

        <Title>{meme.title}</Title>
        <ShareButton onClick={() => fbShare(meme._id)}>
          <i className="fas fa-share-alt"></i>Share
        </ShareButton>

        <Details>
          <div>
            <CategoryLink category={meme.category} />
          </div>

          {!!meme.description && (
            <Description>
              {meme.description.split('\n').map((item, key) => (
                <div key={key}>{item}</div>
              ))}
            </Description>
          )}

          <Tags tags={meme.tags} />

          <MemeHistory meme={meme} />
        </Details>
      </Body>
    </Card>
  );
};

MemeDetails.propTypes = {
  meme: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.string,
    createdAt: PropTypes.string,
    owner: ArtistInfo.propTypes.artist,
    description: PropTypes.string,
  }),
  onClose: PropTypes.func,
};

export default MemeDetails;
