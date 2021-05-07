import PropTypes from 'prop-types';
import styled from 'styled-components';

const getTextAlignment = (props) => {
  if (props.center) return 'center';
  if (props.right) return 'right';
  return 'left';
};

const GroupWrapper = styled.div`
  margin: 0 -4px;
  text-align: ${(props) => getTextAlignment(props)};
  > a {
    margin: 4px;

    ${({ block }) =>
      block &&
      `
      display: flex;
      flex: 1;
      
      > div {
        display: block;
        width: 100%;
      }
    `}
  }
`;

const ButtonGroup = ({ children, center, right, style, block }) => {
  return (
    <GroupWrapper center={center} right={right} style={style} block={block}>
      {children}
    </GroupWrapper>
  );
};

ButtonGroup.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  style: PropTypes.object,
  center: PropTypes.bool,
  right: PropTypes.bool,
  block: PropTypes.bool,
};

export default ButtonGroup;
