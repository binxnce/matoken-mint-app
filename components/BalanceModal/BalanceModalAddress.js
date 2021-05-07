import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Overlay, Tooltip } from 'react-bootstrap';
import delay from 'lodash/delay';

import { LinkButton } from '../Button';

const Address = styled.span`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 1em;
  color: grey;
  margin: 5px 0 -20px 0;
`;

const msgDuration = 2000;

const BalanceModalAddress = ({ address }) => {
  const [copiedMsgCounter, setCopiedMsgCounter] = useState(0);
  const addressTextRef = useRef();

  const copy = async () => {
    if (navigator.clipboard) {
      const success = await navigator.clipboard.writeText(address).then(
        () => true,
        () => false,
      );

      if (success) {
        setCopiedMsgCounter((x) => x + 1);
        delay(() => setCopiedMsgCounter((x) => Math.max(0, x - 1)), msgDuration);
      }
    }
  };

  return (
    <>
      <Title>Dank address:</Title>
      <div className="d-flex align-items-baseline">
        <Address ref={addressTextRef}>{address}</Address>
        <LinkButton small onClick={copy}>
          Copy
        </LinkButton>
        <Overlay target={addressTextRef.current} show={copiedMsgCounter > 0}>
          {(props) => <Tooltip {...props}>Copied to clipboard</Tooltip>}
        </Overlay>
      </div>
    </>
  );
};

BalanceModalAddress.propTypes = {
  address: PropTypes.string.isRequired,
};

export default BalanceModalAddress;
