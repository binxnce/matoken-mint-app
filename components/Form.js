import { Form as BootstrapForm } from 'react-bootstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FormItem from './FormItem';

const Legend = styled.p`
  margin-top: 10px;
  font-size: 12px;
`;

const Form = (props) => {
  const { formData = [], style } = props;
  const hasRequiredItems = !!formData.find((formItem) => formItem.required);

  return (
    <BootstrapForm style={style}>
      {formData.map((formItem) => {
        const { key, custom } = formItem;
        if (custom) return <div key={key}>{custom}</div>;
        return <FormItem key={key} {...formItem} />;
      })}
      {hasRequiredItems && <Legend>* - required</Legend>}
    </BootstrapForm>
  );
};

Form.propTypes = {
  formData: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      required: PropTypes.bool,
      options: PropTypes.array,
      tags: PropTypes.array,
      onTagClick: PropTypes.func,
      helpText: PropTypes.string,
      errorText: PropTypes.string,
      style: PropTypes.object,
      isFileInput: PropTypes.bool,
      custom: PropTypes.object,
    }),
  ).isRequired,
  style: PropTypes.object,
};

export default Form;
