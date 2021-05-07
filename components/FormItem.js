import React, { useState } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { animations } from '../utils/animations';
import { colors } from '../utils/variables';
import { hexToRgba } from '../utils/ui';
import { isObject } from '../utils/common';

const FormItemWrapper = styled.div`
  margin-bottom: 30px;
  ${({ isFileInput }) => isFileInput && 'cursor: pointer;'}
`;

const LabelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

// eslint-disable-next-line no-unused-vars
export const Label = styled(({ isFileInput, ...rest }) => <BootstrapForm.Label {...rest} />)`
  ${({ isFileInput }) =>
    !isFileInput &&
    `
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;
  `}
  display: block;
  margin-bottom: 0;
  display: flex;
  flex-grow: 1;

  ${({ isFileInput }) =>
    isFileInput &&
    `
    cursor: pointer;
    position: absolute;
    bottom: 7px;
    right: 0;
    left: 0;
    z-index: 1;
    height: calc(100% - 4px);
    color: ${colors.secondaryText};
    background-color: #fff;
    display: flex;
    align-items: center;
    font-size: 14px;

    &:after {
      position: absolute;
      right: 0;
      bottom: 2px;
      z-index: 3;
      display: flex;
      align-items: center;
      padding: 4px 10px;
      height: calc(100% - 4px);
      color: ${colors.text};
      content: "Browse";
      border: 2px solid ${colors.secondaryButtonDim};
      border-radius: 4px;
      font-size: 14px;
    }
  `}
`;

// eslint-disable-next-line no-unused-vars
const FormGroup = styled(({ isActive, ...rest }) => <BootstrapForm.Group {...rest} />)`
  && {
    position: relative;
    padding-bottom: 6px;
    margin-bottom: 2px;

    &:before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20px;
      z-index: 10;
      animation: ${animations.lightDimmingLine(colors.secondary)} 6s linear infinite;
      border-bottom-color: ${hexToRgba(colors.secondary, 0.6)};
      filter: blur(1px);
    }

    &:after {
      content: '';
      position: absolute;
      bottom: 1px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${hexToRgba(colors.secondary, 0.5)};
      border-radius: 2px;
    }
    ${({ isActive }) => !isActive && '&:before { display: none; }'}
  }
`;

// eslint-disable-next-line no-unused-vars
const Input = styled(({ isFileInput, hasPadding, alignRight, ...rest }) => <BootstrapForm.Control {...rest} />)`
  && {
    position: relative;
    border: none;
    border-radius: 0;
    background-color: transparent;
    ${({ hasPadding }) => `padding: 6px 0 6px ${hasPadding ? '2px' : 0};`}
    ${({ alignRight }) => alignRight && 'text-align: right;'}
    display: flex;
    flex-grow: 1;
    color: ${colors.text};
    width: auto;
    box-shadow: none;

    &:focus,
    &:active {
      outline: none;
      box-shadow: none;
    }

    ${({ isFileInput }) =>
      isFileInput &&
      `
      position: relative;
      z-index: 2;
      width: 100%;
      height: calc(1.5em + .75rem + 2px);
      margin: 0;
      opacity: 0;
    `}

    &::placeholder {
      color: ${colors.secondaryText};
      font-size: 14px;
    }
  }
`;

const Check = styled(BootstrapForm.Check)`
  && {
    position: relative;
    border: none;
    border-radius: 0;
    background-color: transparent;
    padding-top: 6px;
    padding-bottom: 6px;
    display: flex;
    flex-grow: 1;
    color: ${colors.text};
    width: auto;
    box-shadow: none;
  }
`;

const Tag = styled.span`
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 8px;
  border: 1px solid black;
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin: 2px 4px 2px 0;
`;

const FlexWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
`;

const FormHelp = styled.p`
  font-size: 14px;
  color: ${colors.secondaryText};
`;

export const FormError = styled.p`
  font-size: 14px;
  color: ${colors.error};
  margin-bottom: 20px;
  ${({ center }) => center && 'text-align: center;'}
`;

const FormItem = (props) => {
  const [isActive, setActive] = useState(false);
  const {
    label,
    required,
    options,
    tags,
    onTagClick,
    helpText,
    errorText,
    style,
    isFileInput,
    type,
    labelAddon,
    withSlider,
    ...rest
  } = props;

  return (
    <FormItemWrapper key={label} style={style} isFileInput={isFileInput}>
      <FormGroup isActive={isActive}>
        {(!!label || !!labelAddon) && (
          <LabelWrapper>
            {!!label && (
              <Label isFileInput={isFileInput}>
                {label} {required && '*'}
              </Label>
            )}
            {labelAddon}
          </LabelWrapper>
        )}
        {type === 'number' && withSlider && (
          <FlexWrapper>
            <Input type="range" {...rest} value={rest.value || rest.min || 0} />
          </FlexWrapper>
        )}
        <FlexWrapper>
          {tags &&
            tags.map((t, i) => (
              <Tag key={i} onClick={() => onTagClick(i)}>
                {' '}
                {t}{' '}
              </Tag>
            ))}
          {!['radio', 'checkbox'].includes(type) && (
            <Input
              type={type}
              required={required}
              {...rest}
              onFocus={() => setActive(true)}
              onBlur={() => setActive(false)}
              hasPadding={!!tags}
              alignRight={type === 'number'}
              isFileInput={isFileInput}
            >
              {options &&
                options.map((c, i) => (
                  <option key={i} value={c}>
                    {' '}
                    {c}{' '}
                  </option>
                ))}
            </Input>
          )}
          {['radio', 'checkbox'].includes(type) &&
            options &&
            options.map((option, i) => (
              <Check
                type={type}
                required={required}
                label={isObject(option) ? option.label : option}
                {...rest}
                value={isObject(option) ? option.value : option}
                checked={props.value === (isObject(option) ? option.value : option)}
                key={`${props.id}-${i}`}
                id={`${props.id}-${i}`}
              />
            ))}
        </FlexWrapper>
      </FormGroup>
      {helpText && <FormHelp>{helpText}</FormHelp>}
      {errorText && <FormError>{errorText}</FormError>}
    </FormItemWrapper>
  );
};

FormItem.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  required: PropTypes.bool,
  options: PropTypes.array,
  tags: PropTypes.array,
  onTagClick: PropTypes.func,
  helpText: PropTypes.string,
  errorText: PropTypes.string,
  style: PropTypes.object,
  isFileInput: PropTypes.bool,
  type: PropTypes.string,
  labelAddon: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  custom: PropTypes.object,
  withSlider: PropTypes.bool,
  value: PropTypes.any,
  id: PropTypes.string,
};

export default FormItem;
