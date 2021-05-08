import { Col, Row } from 'react-bootstrap';

import { get, constructQueryParams } from '../utils/http';
import Form from '../components/MintForm';
import mixpanel from '../utils/mixpanel';
import config from '../config';

import CategoryNav from '../components/CategoryNav';

const Home = (props) => {
  return (
    <>
      <Row>
        <Col>
          <CategoryNav />
          <br />
        </Col>
      </Row>
      <Row>
        <Col>
          <Form {...props} />
        </Col>
      </Row>
    </>
  );
};

// export async function getServerSideProps(context) {
//   mixpanel.track('pageOpen', { path: '/' });

//   let queryString = constructQueryParams(context.query);
//   if (queryString) queryString = `?${queryString}`;

//   const resMemes = await get(`${config.apiUrl}/more${queryString}`);
//   return {
//     props: {
//       memesPreloaded: resMemes.data,
//       page: 0,
//     },
//   };
// }

Home.propTypes = {};

export default Home;
