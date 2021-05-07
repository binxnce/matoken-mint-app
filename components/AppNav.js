import { Navbar } from 'react-bootstrap';
import styled from 'styled-components';
import Link from 'next/link';

import { fontSize } from '../utils/variables';

import Auth from './Auth';
// import LinkNavItem from './LinkNavItem';

const Bar = styled(Navbar)`
  padding: 40px 0 30px 0;
  font-size: ${fontSize.s};
`;

const Logo = styled(Navbar.Brand)`
  &&,
  &&:active,
  &&:visited {
    color: white;
    background: #5d5d5d;
    padding: 0.5em 1em;
    font-size: 1em;
  }
`;

const AppNav = () => {
  return (
    <Bar variant="light" expand="sm" collapseOnSelect>
      <Link href="/" passHref>
        <Logo>matokenswap</Logo>
      </Link>
      <Link href="/about" passHref>
        About / FAQ
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse>
        {/* <Nav>
          <LinkNavItem href="/TODO">Meme of the day</LinkNavItem>
          <LinkNavItem href="/TODO">Random meme</LinkNavItem>
        </Nav> */}
        <Auth />
      </Navbar.Collapse>
    </Bar>
  );
};

export default AppNav;
