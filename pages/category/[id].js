import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Error from 'next/error';
import { Col, Row } from 'react-bootstrap';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { get as getMemes } from '../../utils/http';
import MemeFeed from '../../components/MemeFeed';
import CategoryNav from '../../components/CategoryNav';
import mixpanel from '../../utils/mixpanel';
import config from '../../config';
import { fontSize } from '../../utils/variables';

const SpacedRow = styled(Row)`
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: ${fontSize.xxxl};
`;

const Category = (props) => {
  if (!props.categoryFound) {
    return <Error statusCode={404} />;
  }

  const { id: categoryName } = useRouter().query;
  return (
    <>
      <Head>
        <title>{categoryName}</title>
        <meta property="og:title" content={`${categoryName}`} />
      </Head>
      <SpacedRow>
        <Col>
          <CategoryNav />
        </Col>
      </SpacedRow>
      <SpacedRow>
        <Col>
          <Title>{categoryName}</Title>
        </Col>
      </SpacedRow>
      <Row>
        <Col>
          <MemeFeed {...props} category={categoryName} />
        </Col>
      </Row>
    </>
  );
};

Category.propTypes = {
  categoryFound: PropTypes.bool.isRequired,
  memesPreloaded: PropTypes.shape({
    memes: PropTypes.array,
    more: PropTypes.bool,
  }).isRequired,
  page: PropTypes.number.isRequired,
};

export async function getServerSideProps(context) {
  let memesPreloaded = null;
  let categoryFound = true;

  try {
    const res = await getMemes(`${config.apiUrl}/more?category=${context.params.id}`);
    memesPreloaded = res.data;
    mixpanel.track('pageOpen', { path: `/category/${context.params.id}` });
  } catch (e) {
    context.res.statusCode = 404;
    categoryFound = false;
  }

  return {
    props: {
      categoryFound,
      memesPreloaded,
      page: 0,
    },
  };
}

export default Category;
