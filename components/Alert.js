import styled from 'styled-components';
import PropTypes from 'prop-types';
import { animations } from '../utils/animations';
import { colors } from '../utils/variables';
import { hexToRgba } from '../utils/ui';

const AlertWrapper = styled.div`
  padding: 2px 20px;
  border-radius: 10px;
  color: ${colors.warning};
  display: flex;
  align-items: center;
  border: 2px solid ${hexToRgba(colors.warning, 0.5)};
  margin: 20px 0;
  animation: ${animations.lightDimming(colors.warning)} 8s linear infinite;
  opacity: 0.85;
  background-color: ${hexToRgba(colors.warning, 0.1)};
`;

const Symbol = styled.p`
  font-size: 36px;
  font-weight: 600;
  animation: ${animations.flicker} cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
  animation-duration: 4s;
  color: ${colors.warning};
  margin-right: 16px;
`;

const Text = styled.p`
  margin: 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Alert = ({ children }) => {
  return (
    <AlertWrapper>
      <Symbol>!</Symbol>
      <Text>{children}</Text>
    </AlertWrapper>
  );
};

Alert.propTypes = {
  children: PropTypes.string,
};

export default Alert;
