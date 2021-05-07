import React from 'react';
import PropTypes from 'prop-types';
import { Nav } from 'react-bootstrap';
import { useRouter } from 'next/router';

import LinkNavItem from './LinkNavItem';

const subpages = [
  { name: 'History', route: '/me/history' },
  { name: 'Owned', route: '/me/owned-memes' },
  { name: 'Created', route: '/me/created-memes' },
  { name: 'Transactions to sign', route: '/me/pending-transactions' },
];

const ProfileNav = ({ className }) => {
  const { pathname } = useRouter();

  return (
    <Nav variant="pills" activeKey={pathname} className={className}>
      {subpages.map(({ name, route }) => (
        <LinkNavItem key={route} href={route} eventKey={route}>
          {name}
        </LinkNavItem>
      ))}
    </Nav>
  );
};

ProfileNav.propTypes = {
  className: PropTypes.string,
};

export default ProfileNav;
