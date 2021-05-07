import Link from 'next/link';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Nav as BootstrapNav } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { signOutUser } from '../redux/users';
import { colors, media } from '../utils/variables';
import serviceContext from '../services/serviceContext';

const LinkLabel = styled(BootstrapNav.Link)`
  && {
    font-size: 14px;
    opacity: 0.5;
    transition: opacity, 1s;
    padding: 10px 20px !important;
    cursor: pointer;

    &:hover {
      opacity: 1;
      color: ${colors.main}!important;
    }

    &.active {
      color: ${colors.main}!important;
      opacity: 1;
    }

    @media ${media.max.mobileL} {
      font-size: 18px;
    }
  }
`;

const DropDown = styled.div`
  border: none;
  border-radius: 4px;
  position: relative;
  text-align: center;

  @media ${media.min.mobileL} {
    &:before {
      display: block;
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border-radius: 4px;
      box-shadow: 0px 0px 15px 0px #dedede;
      z-index: -1;
    }
  }
`;

const ProfileButton = ({ activePageId, avatar, className }) => {
  const dispatch = useDispatch();
  const { sdkService } = useContext(serviceContext);

  const onLogout = async (e) => {
    e.preventDefault();

    sdkService
      .killSession()
      .then(() => signOutUser()(dispatch))
      .catch(() => null)
      .finally(() => {
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      });
  };

  return (
    <div className={className}>
      <div className="btn-group">
        <img
          className="clickable rounded nav-avatar"
          src={avatar}
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        ></img>
        <DropDown className="dropdown-menu dropdown-menu-right">
          <Link href="/me" passHref>
            <LinkLabel eventKey={'me'} active={activePageId === 'me'}>
              Profile
            </LinkLabel>
          </Link>
          <LinkLabel onClick={onLogout}>Log out</LinkLabel>
        </DropDown>
      </div>
    </div>
  );
};

ProfileButton.propTypes = {
  className: PropTypes.string,
  avatar: PropTypes.string,
  activePageId: PropTypes.string,
};

export default ProfileButton;
