import { Nav, Container } from 'react-bootstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { colors } from '../utils/variables';

const FooterWrapper = styled.div`
  position: relative;
  overflow: hidden;
  background-color: ${colors.footer};
  height: 60px;
`;

const FloatingShadow = styled.div`
  border-radius: 10px;
  height: 50px;
  width: 100%;
  position: absolute;
  top: -40px;
  left: 0;
  -webkit-box-shadow: 0px 0px 50px 0px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: 0px 0px 50px 0px rgba(0, 0, 0, 0.3);
  box-shadow: 0px 0px 50px 0px rgba(0, 0, 0, 0.3);
`;

const NavItem = styled(Nav.Item)`
  padding: 20px 0;
`;

const LegalTag = styled.p`
  font-size: 14px;
  color: ${colors.text};
  padding: 6px 14px;
`;

/*const NavLink = styled(Nav.Link)`
  && {
    color: ${colors.secondaryText};
    font-size: 12px;
    transition: opacity, 1s;
    opacity: 0.5;
    padding: 8px 14px;

    &:hover {
      color: ${colors.main};
      opacity: 1;
    }
  }
`;*/

const Footer = ({ className = '' }) => (
  <FooterWrapper className={className}>
    <FloatingShadow />
    <Container>
      <Nav>
        <NavItem className="ml-auto">
          <LegalTag>2021 © Matoken</LegalTag>
        </NavItem>
      </Nav>
    </Container>
  </FooterWrapper>
);

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
