import React, { useState, useEffect, useRef } from 'react';
import Swiper from 'react-id-swiper';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import { colors } from '../utils/variables';
import { animations } from '../utils/animations';
import { hexToRgba } from '../utils/ui';

const StepsIndicators = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 30px;
`;

const SwiperWrapper = styled.div`
  transition: height 1s;

  .swiper-container {
    padding: 0 1em;
    margin: 0 -1em;
  }
`;

const StepNumber = styled.p`
  font-size: ${({ small }) => (small ? 20 : 30)}px;
  line-height: ${({ small }) => (small ? 20 : 30)}px;
  margin-top: ${({ small }) => (small ? 4 : 8)}px;
  margin-bottom: 4px;
  text-align: center;
  font-weight: 600;
`;

const StepTitleWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
`;

const StepTitle = styled.p`
  font-size: ${({ small }) => (small ? 12 : 14)}px;
  line-height: ${({ small }) => (small ? 16 : 20)}px;
  text-align: center;
`;

const StepWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 10px;
  width: 100%;
  border-radius: 4px;
  justify-content: flex-start;
  align-items: center;
  border: 2px solid ${hexToRgba('#000000', 0.3)};
`;

const StepIndicator = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  & + & {
    margin-left: 20px;
  }

  ${StepNumber} {
    ${({ active }) =>
      active &&
      css`
        animation: ${animations.textFlickering} 2s linear forwards;
      `};
    ${({ done }) => done && `color: ${colors.main}`};
  }

  ${StepWrapper} {
    ${({ active }) =>
      active &&
      css`
        animation: ${animations.blinkAndLightOn(colors.main)} 2s linear forwards;
      `};
    ${({ done }) => done && `border-color: ${colors.main}`};
    opacity: ${({ active, done }) => (active || done ? 1 : 0.5)};
  }
`;

const getStepNumber = (index) => {
  const stepNumber = index + 1;
  if (stepNumber.toString().length === 1) {
    return '0' + stepNumber;
  }
  return stepNumber;
};

const SWIPE_SPEED = 300;

const Stepper = ({ steps, small, nested }) => {
  const swiperRef = useRef(null);

  const [currentIndex, updateCurrentIndex] = useState(0);
  const params = {
    spaceBetween: 30,
    loop: false,
    autoplay: false,
    initialSlide: currentIndex,
    noSwiping: true,
    nested: nested,
    autoHeight: true,
    speed: SWIPE_SPEED,
  };

  const goNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
      updateCurrentIndex(swiperRef.current.swiper.realIndex);
    }
  };
  const goPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
      updateCurrentIndex(swiperRef.current.swiper.realIndex);
    }
  };

  const updateStepper = async () => {
    if (swiperRef.current.swiper) {
      swiperRef.current.swiper.update();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateStepper();
    }, SWIPE_SPEED);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <>
      <StepsIndicators>
        {steps.map(({ id, title }, index) => (
          <StepIndicator key={`step_${id}`} active={index === currentIndex} done={index < currentIndex}>
            <StepWrapper small={small}>
              <StepNumber small={small}>{getStepNumber(index)}</StepNumber>
              <StepTitleWrapper>
                <StepTitle small={small}>{title}</StepTitle>
              </StepTitleWrapper>
            </StepWrapper>
          </StepIndicator>
        ))}
      </StepsIndicators>
      <SwiperWrapper>
        {!!steps && (
          <Swiper {...params} ref={swiperRef}>
            {steps.map(({ id, content }, index) => {
              const active = index === currentIndex;
              return <div key={`slide_${id}`}>{content({ active, goNext, goPrev, updateStepper })}</div>;
            })}
          </Swiper>
        )}
      </SwiperWrapper>
    </>
  );
};

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.func.isRequired,
    }),
  ),
  small: PropTypes.bool,
  nested: PropTypes.bool,
};

export default Stepper;
