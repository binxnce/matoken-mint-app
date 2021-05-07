import styled from 'styled-components';

import Button from './Button';

const BigCloseButton = styled(Button).attrs(() => ({
  children: <i className="fas fa-times"></i>,
  variant: 'navigation',
}))`
  padding: 0;
  width: 50px;
  height: 50px;
`;

export default BigCloseButton;
