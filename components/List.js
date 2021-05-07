import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from '../utils/variables';

const ListWrapper = styled.div`
  margin-bottom: -14px;
  font-size: 14px;
`;

const ItemWrapper = styled.div`
  padding: 14px 0;
  display: flex;
  justify-content: space-between;

  &:not(:last-child) {
    border-bottom: 1px solid #e2cdec;
  }
`;

const Username = styled.p`
  color: ${colors.text};
  padding-right: 10px;
`;

// const Value = styled.p`
//   color: ${colors.secondaryText};
//   padding-left: 10px;
// `;

const UserListItem = (props) => {
  const {
    verticalSpacing,
    label,
    // value,
  } = props;
  return (
    <ItemWrapper verticalSpacing={verticalSpacing}>
      <Username>{label || 'N/A'}</Username>
      {/* <Value>
        {value}
      </Value> */}
    </ItemWrapper>
  );
};

const List = (props) => {
  const { data = [], verticalSpacing } = props;
  if (!data.length) return null;
  return (
    <ListWrapper verticalSpacing={verticalSpacing}>
      {data.map((item, index) => (
        <UserListItem verticalSpacing={verticalSpacing} key={index} {...item} />
      ))}
    </ListWrapper>
  );
};

UserListItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  verticalSpacing: PropTypes.number,
};

List.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
  verticalSpacing: PropTypes.number,
};

export default List;
