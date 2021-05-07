import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Image, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { hexToRgba } from '../utils/ui';
import { colors } from '../utils/variables';
import { getUser } from '../redux/users';
import { isLoggedInSelector } from '../redux/selectors';

import Title from './Title';
import ProfileNav from './ProfileNav';
import UserSettingsModal from './UserSettingsModal';

const UsernameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const EditButton = styled(Button)`
  margin-bottom: 16px;
`;

const ImageWrapper = styled.a`
  cursor: pointer;
  position: relative;
  display: flex;

  > img {
    padding: 0;
    border: none;
  }

  &:after {
    content: 'Change';
    display: flex;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background-color: ${hexToRgba(colors.main, 0.5)};
    opacity: 0;
    transition: all 0.5s;
    border-radius: 4px;
    overflow: hidden;
  }

  &:hover {
    &:after {
      opacity: 1;
    }
  }
`;

const ProfileSubpage = ({ ContentComponent }) => {
  const dispatch = useDispatch();
  const { current: user } = useSelector((state) => state.users);
  const [isUserSettingsModalVisible, setUserSettingsModalVisible] = useState(false);
  const [activeUserSettingsType, setActiveUserSettingsType] = useState('');
  const isLoggedIn = useSelector(isLoggedInSelector);

  useEffect(() => {
    getUser()(dispatch);
  }, []);

  const editUsername = () => {
    setActiveUserSettingsType('USERNAME');
    setUserSettingsModalVisible(true);
  };

  const editProfileImage = () => {
    setActiveUserSettingsType('PHOTO');
    setUserSettingsModalVisible(true);
  };

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
      <Row className="my-3">
        <Col lg={2} md={3} sm={3} xs={3}>
          <ImageWrapper onClick={editProfileImage}>
            <Image thumbnail src={user.avatarUrl} alt="" />
          </ImageWrapper>
        </Col>
        <Col lg={10} md={9} sm={9} xs={9}>
          <Title text="Hello, " mb={6} />
          <UsernameWrapper>
            <Title flickerTimes={{ item3: 10 }} text={user.name} large style={{ marginRight: 16 }} />
            <EditButton onClick={editUsername} size="sm">
              Edit
            </EditButton>
          </UsernameWrapper>
        </Col>
      </Row>
      <Row>
        <Col>
          <ProfileNav className="mb-3" />
          <ContentComponent />
        </Col>
      </Row>
      <UserSettingsModal
        isShown={isUserSettingsModalVisible}
        onHide={() => setUserSettingsModalVisible(false)}
        type={activeUserSettingsType}
        user={user}
      />
    </>
  );
};

ProfileSubpage.propTypes = {
  ContentComponent: PropTypes.elementType.isRequired,
};

export default ProfileSubpage;
