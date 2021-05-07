import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import http from '../utils/http';
import config from '../config';
import Form from './Form';
import { FormError } from './FormItem';
import Button from './NeonButton';
import ButtonGroup from './ButtonGroup';
import Modal, { ModalTitle } from './Modal';
import { updateMeme } from '../redux/memes';

const MAX_DESCRIPTION_LENGTH = 500;

const FormErrorWrapper = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const FormWrapper = styled.div`
  padding: 10px 12px;
`;

const ArchiveBlock = styled.div`
  padding-top: 50px;
`;

const ArchiveNote = styled.div`
  font-size: 13px;
  padding-left: 4px;
  font-weight: normal;
`;

const initialState = {
  memeId: '',
  title: '',
  tags: [''],
  description: '',
  isArchived: false,
  boughtTimes: 0,
  soldTimes: 0,
};

const EditMemeModal = ({ isShown, onHide, memeId }) => {
  const dispatch = useDispatch();
  const [inputErrors, setInputErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [isTagInputDisabled, setIsTagInputDisabled] = useState(false);

  const [memeData, setMemeData] = useState(initialState);

  useEffect(() => {
    if (!memeId) {
      return;
    }
    setMemeData(initialState);
    http
      .get(`${config.apiUrl}/meme/${memeId}?creator`)
      .then(({ data: { meme } }) => {
        const data = {
          memeId: meme._id,
          title: meme.title,
          description: meme.description,
          tags: meme.tags,
          isArchived: meme.isArchived,
          boughtTimes: meme.boughtTimes,
          soldTimes: meme.soldTimes,
        };
        setMemeData(data);
      })
      .catch(console.error);
  }, [isShown]);

  const detectCommaAndLimit = (event) => {
    const char = event.target.value[event.target.value.length - 1];
    setTagInput(event.target.value);

    if (!isTagInputDisabled && char === ',') {
      const tag = tagInput.replace(',', '');
      setTagInput('');
      if (!tag) {
        return;
      }
      setMemeData({ ...memeData, tags: [...memeData.tags, tag] });
    }

    setIsTagInputDisabled(memeData.tags.length === 3);
  };

  const detectBackspace = (event) => {
    if (isTagInputDisabled && event.keyCode !== 8) {
      setTagInput('');
      return;
    }

    if (event.keyCode === 8 && !tagInput && memeData.tags.length > 0) {
      const reducedTags = memeData.tags.slice(0, memeData.tags.length - 1);
      setMemeData({ ...memeData, tags: reducedTags });
    }
  };

  const removeTag = (tagIndex) => {
    const tags = memeData.tags.filter((v, i) => i !== tagIndex);
    setMemeData({ ...memeData, tags });
  };

  const handleCancel = () => {
    setInputErrors({});
    if (onHide) onHide();
  };

  const validateMeme = (meme) => {
    setInputErrors({});

    const errors = {};
    if (!meme.title) {
      errors.title = 'Title is required';
    }

    if (Object.keys(errors).length) {
      setInputErrors(errors);
    }

    return errors;
  };

  const onResponse = () => {
    onHide(true);
  };

  const sendForm = () => {
    const errors = validateMeme(memeData);
    if (Object.keys(errors).length) return;

    updateMeme(memeData, onResponse)(dispatch);
  };

  const handleArchive = () => {
    if ((memeData.boughtTimes > 0 || memeData.soldTimes > 0) && !memeData.isArchived) {
      alert("You can't archive your meme since someone already bought or sold it");
      return;
    }

    const errors = validateMeme(memeData);
    if (Object.keys(errors).length) return;
    updateMeme(
      {
        ...memeData,
        isArchived: !memeData.isArchived,
      },
      onResponse,
    )(dispatch);
  };

  return (
    <Modal show={isShown} onHide={onHide}>
      <ModalTitle className="mb-4">Edit meme details</ModalTitle>
      <FormWrapper>
        <Form
          formData={[
            {
              key: 'title',
              label: 'Title',
              required: true,
              value: memeData.title,
              type: 'text',
              name: 'title',
              onChange: ({ target }) => {
                setMemeData({ ...memeData, title: target.value });
              },
              errorText: inputErrors['title'],
            },
            {
              key: 'tags',
              label: 'Tags',
              id: 'tags',
              value: tagInput,
              onChange: detectCommaAndLimit,
              onKeyUp: detectBackspace,
              tags: memeData.tags,
              onTagClick: removeTag,
              helpText: 'Comma separated | max 3',
            },
            {
              key: 'description',
              label: 'Description',
              as: 'textarea',
              value: memeData.description,
              onChange: ({ target }) => {
                setMemeData({ ...memeData, description: target.value.substring(0, MAX_DESCRIPTION_LENGTH) });
              },
              name: 'description',
              helpText: `${memeData.description?.length || 0}/${MAX_DESCRIPTION_LENGTH} characters used`,
            },
          ]}
        />
        <ButtonGroup center>
          <Button tertiary onClick={handleCancel} text="Cancel" />
          <Button main onClick={sendForm} text="Update" />
        </ButtonGroup>
        {!!Object.keys(inputErrors).length && (
          <FormErrorWrapper>
            <FormError style={{ marginBottom: 10 }}>Add missing information and try again</FormError>
          </FormErrorWrapper>
        )}
        <ArchiveBlock>
          <ButtonGroup center>
            <Button danger text={memeData.isArchived ? 'Un-archive meme' : 'Archive meme'} onClick={handleArchive} />
          </ButtonGroup>
          <ArchiveNote>
            You can archive your meme while it has no sales recorded.
            <br />
            It will be possible to un-archive it at any time
          </ArchiveNote>
        </ArchiveBlock>
      </FormWrapper>
    </Modal>
  );
};

EditMemeModal.propTypes = {
  isShown: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  memeId: PropTypes.string.isRequired,
};

export default EditMemeModal;
