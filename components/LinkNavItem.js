import { Nav } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Link from 'next/link';

const LinkNavItem = ({ href, children, eventKey, className }) => (
  <Nav.Item>
    <Link href={href} passHref>
      <Nav.Link className={className} eventKey={eventKey}>
        {children}
      </Nav.Link>
    </Link>
  </Nav.Item>
);

LinkNavItem.propTypes = {
  href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  children: PropTypes.node.isRequired,
  eventKey: PropTypes.string,
  className: PropTypes.string,
};

export default LinkNavItem;
