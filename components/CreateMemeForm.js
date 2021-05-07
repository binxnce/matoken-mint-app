import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { getUser } from '../redux/users';
import config from '../config';
import { createMeme } from '../redux/memes';

import Form from './Form';
import Button from './NeonButton';
import ButtonGroup from './ButtonGroup';
import { FormError, Label } from './FormItem';
import ImageFormItem from './ImageFormItem';

const FormErrorWrapper = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const TITLE = 'title';
const IMAGE = 'image';

const MAX_DESCRIPTION_LENGTH = 500;

const maxShardsOptions = ['100', '1000'];
const defaultMaxShards = maxShardsOptions[1];

const CreateMemeForm = ({ onDismiss, onSuccess, updateStepper }) => {
  const { categories = [] } = config;

  const dispatch = useDispatch();

  useEffect(() => {
    getUser()(dispatch);
  }, []);

  const [meme, setMeme] = useState({
    title: '',
    category: categories[0],
    tags: [],
    imageLink: undefined,
    image: undefined,
    description: '',
    maxShards: defaultMaxShards,
  });
  const { tags } = meme;
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isTagInputDisabled, setIsTagInputDisabled] = useState(false);
  const [inputErrors, setInputErrors] = useState({});

  useEffect(() => {
    if (updateStepper) updateStepper();
  }, [inputErrors, tags]);

  const saveToState = (e) => {
    setMeme({ ...meme, [e.target.name]: e.target.value });
  };

  // tag field
  const detectBackspace = (event) => {
    if (isTagInputDisabled && event.keyCode !== 8) {
      setTagInput('');
      return;
    }

    if (event.keyCode === 8 && !tagInput && meme.tags.length > 0) {
      // on backspace press
      const reducedTags = meme.tags.slice(0, meme.tags.length - 1);
      setMeme({ ...meme, tags: reducedTags });
    }
  };

  const detectCommaAndLimit = (event) => {
    const char = event.target.value[event.target.value.length - 1];
    setTagInput(event.target.value);

    if (!isTagInputDisabled && char === ',') {
      // on comma press
      const tag = tagInput.replace(',', '');
      setTagInput('');
      if (!tag) {
        return;
      }
      setMeme({ ...meme, tags: [...meme.tags, tag] });
    }

    setIsTagInputDisabled(meme.tags.length === 3);
  };

  const removeTag = (tagIndex) => {
    const tags = meme.tags.filter((v, i) => i !== tagIndex);
    setMeme({ ...meme, tags });
  };

  // image
  const updateImage = ({ imageFile, previewSrc }) => {
    if (imageFile) {
      setMeme({ ...meme, image: imageFile, imageLink: undefined });
    } else {
      setMeme({ ...meme, imageLink: previewSrc, image: undefined });
    }
  };

  const validateMeme = (meme) => {
    const errors = {};
    if (!meme.title || meme.title.length === 0) {
      errors[TITLE] = 'Title is required';
    }
    if (!meme.image && !meme.imageLink) {
      errors[IMAGE] = 'Image is required';
    }
    return errors;
  };

  const onResponse = (response) => {
    const { data, status } = response || {};
    setIsLoading(false);
    if (status === 413) {
      setInputErrors({ [IMAGE]: 'Image too large' });
      return;
    }

    const newMemeId = data?.data?.id;
    onSuccess({ memeId: newMemeId });
  };

  const sendForm = () => {
    if (isLoading) return;
    setInputErrors({});
    const errors = validateMeme(meme);

    if (Object.keys(errors).length) {
      return setInputErrors(errors);
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('tags', meme.tags);
    formData.append('title', meme.title);
    formData.append('category', meme.category);
    formData.append('maxShards', meme.maxShards);
    if (meme.image) {
      formData.append('image', meme.image);
    } else if (meme.imageLink) {
      formData.append('imageLink', meme.imageLink);
    }
    if (meme.description) {
      formData.append('description', meme.description.substring(0, MAX_DESCRIPTION_LENGTH));
    }
    createMeme(formData, onResponse)(dispatch);
  };

  const handleCancel = () => {
    setInputErrors({});
    if (onDismiss) onDismiss();
  };

  return (
    <>
      <Form
        formData={[
          {
            key: 'title',
            label: 'Title',
            required: true,
            value: meme.title,
            type: 'text',
            name: TITLE,
            onChange: saveToState,
            errorText: inputErrors[TITLE],
          },
          {
            key: 'category',
            label: 'Category',
            as: 'select',
            required: true,
            value: meme.category,
            name: 'category',
            onChange: saveToState,
            options: categories,
          },
          {
            key: 'tags',
            label: 'Tags',
            id: 'tags',
            value: tagInput,
            onChange: detectCommaAndLimit,
            onKeyUp: detectBackspace,
            tags: meme.tags,
            onTagClick: removeTag,
            helpText: 'Comma separated | max 3',
          },
          {
            key: 'description',
            label: 'Description',
            as: 'textarea',
            value: meme.description,
            onChange: ({ target }) =>
              setMeme({ ...meme, description: target.value.substring(0, MAX_DESCRIPTION_LENGTH) }),
            name: 'description',
            helpText: `${meme.description?.length || 0}/${MAX_DESCRIPTION_LENGTH} characters used`,
          },
          {
            key: 'maxShards',
            id: 'maxShards',
            label: 'Shards',
            type: 'radio',
            value: meme.maxShards,
            name: 'maxShards',
            onChange: saveToState,
            options: maxShardsOptions,
          },
          {
            key: 'imageLabel',
            custom: <Label>Image</Label>,
          },
          {
            key: 'image',
            custom: (
              <ImageFormItem
                onCorrectImage={updateImage}
                error={inputErrors[IMAGE]}
                onComponentResize={updateStepper}
              />
            ),
          },
        ]}
      />

      <ButtonGroup center style={{ marginTop: 20 }}>
        <Button big tertiary text="Cancel" onClick={handleCancel} />
        <Button big main text="Create" onClick={sendForm} disabled={isLoading} />
      </ButtonGroup>
      {!!Object.keys(inputErrors).length && (
        <FormErrorWrapper>
          <FormError style={{ marginBottom: 10 }}>Add missing information and try again</FormError>
        </FormErrorWrapper>
      )}
    </>
  );
};

CreateMemeForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  updateStepper: PropTypes.func,
  onDismiss: PropTypes.func.isRequired,
};

export default CreateMemeForm;
