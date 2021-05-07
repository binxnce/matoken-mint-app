import { Nav } from 'react-bootstrap';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import config from '../config';
import { fontSize } from '../utils/variables';
import LinkNavItem from './LinkNavItem';

const filters = [
  // { id: 'rare', label: 'Rare' },
  { id: 'running-out-fast', label: 'Running out fast' },
  { id: 'nearly-sold-out', label: 'Nearly sold out' },
];

const Wrapper = styled.div`
  display: flex;
  font-size: ${fontSize.s};
`;

const FilterIcon = styled.img`
  margin-right: 0.5em;
`;

const CategoryNav = () => {
  const { route, query } = useRouter();
  const activeCategory = route === '/category/[id]' && query.id;
  const activeFilter = ['/', '/category/[id]'].includes(route) && query.q;

  return (
    <Wrapper>
      <Nav variant="pills" activeKey={activeCategory}>
        {config.categories.map((id) => (
          <LinkNavItem key={id} href={`/category/${id}`} eventKey={id}>
            {id}
          </LinkNavItem>
        ))}
      </Nav>
      <Nav className="ml-auto nav-borderless" activeKey={activeFilter}>
        {filters.map(({ id, label }) => (
          <LinkNavItem key={id} href={{ pathname: route, query: { ...query, q: id } }} eventKey={id}>
            {/* hidden until the assets are created so it doesn't show a missing image icon */}
            {false && <FilterIcon src={`/images/icon-filter-${id}.png`} />}
            {label}
          </LinkNavItem>
        ))}
      </Nav>
    </Wrapper>
  );
};

export default CategoryNav;
