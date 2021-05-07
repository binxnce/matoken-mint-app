import styled from 'styled-components';
import { colors } from '../utils/variables';

export default styled.div`
  &:not(:last-child) {
    padding-bottom: 0.5em;
    margin-bottom: 0.5em;
    border-bottom: 1px solid ${colors.separator};
  }
`;
