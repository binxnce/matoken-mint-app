import PropTypes from 'prop-types';
import styled from 'styled-components';

import { colors } from '../utils/variables';

const TagsWrapper = styled.div`
  margin: 0 -2px;
`;

const Tag = styled.div`
  display: inline-block;
  font-size: 10px;
  padding: 3px 6px;
  margin: 2px;
  border: 1px solid ${colors.tertiaryButton};
  border-radius: 4px;
  background-color: ${colors.tertiaryButtonDim};
  line-height: 1;
  color: ${colors.text};
`;

const Tags = ({ tags }) => {
  const uniqueTags = tags && tags.filter((value, index, _this) => _this.indexOf(value) === index);

  return (
    <TagsWrapper>
      {uniqueTags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </TagsWrapper>
  );
};

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Tags;
