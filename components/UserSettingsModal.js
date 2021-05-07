import { useDispatch } from 'react-redux';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { getUser } from '../redux/users';
import http from '../utils/http';
import config from '../config';

import FormItem from './FormItem';
import Button from './NeonButton';
import ButtonGroup from './ButtonGroup';
import ImageUpload from './ImageUpload';
import Modal, { ModalTitle } from './Modal';

const modalData = {
  USERNAME: {
    title: 'Update your username',
  },
  PHOTO: {
    title: 'Update your photo',
  },
};

const Preview = styled(Image)`
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
`;

const UserSettingsModal = (props) => {
  const dispatch = useDispatch();
  const { type, onHide, user } = props;
  const title = modalData[type]?.title;

  const [previewSrc, setPreviewSrc] = useState(undefined);
  const [newUserParams, setNewUserParams] = useState({});
  const [error, setError] = useState(undefined);

  useEffect(() => {
    const { name, avatarUrl } = props.user;
    setNewUserParams({ name, image: avatarUrl });
  }, [user]);

  // profile avatar
  const validImageMimeTypes = ['image/png', 'image/jpeg'];
  const updateImage = useCallback(
    (previewSrc, file) => {
      setPreviewSrc(previewSrc);
      setNewUserParams({ ...newUserParams, image: file });
    },
    [newUserParams],
  );

  const validateUser = (user) => {
    if (user.name.length === 0) {
      return 'Name too short';
    }
    return;
  };

  const updateUser = () => {
    const error = validateUser(newUserParams);
    if (error) {
      return setError(error);
    }

    const formData = new FormData();
    if (newUserParams.image) {
      formData.append('image', newUserParams.image);
    }
    formData.append('name', newUserParams.name);
    http
      .post(config.apiUrl + '/me', formData)
      .then(() => getUser()(dispatch))
      .catch((e) => setError(e.message));
  };

  return (
    <Modal show={props.isShown} onHide={onHide}>
      <ModalTitle className="mb-4">{title}</ModalTitle>
      {type === 'USERNAME' ? (
        <FormItem
          key="name"
          label="Name"
          type="text"
          name="name"
          required
          value={newUserParams.name}
          onChange={(e) => setNewUserParams({ ...newUserParams, name: e.target.value })}
          errorText={error}
        />
      ) : (
        <>
          <Preview style={{ width: '100%', height: '100%' }} thumbnail src={previewSrc || user.avatarUrl} alt="" />
          <ImageUpload
            onImageChange={updateImage}
            validImageMimeTypes={validImageMimeTypes}
            minWidthSize={100}
            style={{ marginTop: 20 }}
          />
        </>
      )}
      <ButtonGroup center>
        <Button
          main
          onClick={() => {
            updateUser();
            onHide();
          }}
          text="Update"
        />
        <Button tertiary onClick={onHide} text="Cancel" />
      </ButtonGroup>
    </Modal>
  );
};

UserSettingsModal.propTypes = {
  isShown: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
};

export default UserSettingsModal;
