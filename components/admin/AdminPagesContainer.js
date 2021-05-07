import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { getUser } from '../../redux/users';
import { isLoggedInSelector } from '../../redux/selectors';
import Title from '../Title';

const AdminPagesContainer = ({ ContentComponent }) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(isLoggedInSelector);

  useEffect(() => {
    getUser()(dispatch);
  }, []);

  if (!isLoggedIn) {
    return (
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Title text="You must be logged in to view this page." small />
        </Col>
      </Row>
    );
  }

  return (
    <>
      {/*<AdminNav />*/}
      <ContentComponent />
    </>
  );
};

AdminPagesContainer.propTypes = {
  ContentComponent: PropTypes.elementType.isRequired,
};

export default AdminPagesContainer;
