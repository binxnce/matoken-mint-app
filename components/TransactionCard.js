import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import moment from 'moment';

import MemeImage from './MemeImage';
import Button from './NeonButton';
import ButtonGroup from './ButtonGroup';
import TableListEntry from './TableListEntry';

import { colors } from '../utils/variables';

const CardHeader = styled(Row)`
  align-items: center;
`;

const CardHeaderRow = styled(Row)`
  margin: 0 -6px;
  align-items: center;
`;

const CardHeaderColumn = styled(Col)`
  padding: 0 6px;
`;

const ImageCrop = styled.div`
  max-width: 100%;
  position: relative;
  overflow: hidden;
  max-height: 90px;
  display: flex;
  align-items: center;
`;

const CardMemeImage = styled(MemeImage)`
  max-width: 100%;
`;

const CardTitle = styled.h6`
  text-transform: none;
  font-weight: 500;
  color: ${colors.text};
  margin: 0;
`;

const Label = styled.p`
  text-transform: none;
  font-weight: 400;
  color: ${colors.secondaryText};
  font-size: 12px;
  margin: 0;
`;

const TransactionCard = (props) => {
  const {
    action,
    memeInfo,
    createdAt,
    transactions,
    meme: memeId,
    sendTransactions,
    cancelTransaction,
    _id: transactionGroupId,
  } = props;

  return (
    <TableListEntry>
      <CardHeader>
        <Col lg={10} md={9} sm={12} xs={12}>
          <CardHeaderRow>
            <CardHeaderColumn lg={3} md={2} sm={2} xs={3}>
              {!!memeInfo && (
                <ImageCrop>
                  <CardMemeImage meme={memeInfo} />
                </ImageCrop>
              )}
            </CardHeaderColumn>
            <CardHeaderColumn lg={5} md={6} sm={10} xs={9}>
              <CardTitle>{action}</CardTitle>
              <Label>
                {moment(createdAt)
                  .utc(true)
                  .format('MMMM DD YYYY H:mm:ss')}
              </Label>
            </CardHeaderColumn>
          </CardHeaderRow>
        </Col>
        <Col lg={2} md={3} sm={12} xs={12}>
          <ButtonGroup block>
            <Button text="Sign" onClick={() => sendTransactions(transactions, transactionGroupId)} main block />
            <Button text="Cancel" onClick={() => cancelTransaction(transactionGroupId, memeId)} tertiary block />
          </ButtonGroup>
        </Col>
      </CardHeader>
    </TableListEntry>
  );
};

TransactionCard.propTypes = {
  _id: PropTypes.string,
  action: PropTypes.string.isRequired,
  memeInfo: PropTypes.object,
  createdAt: PropTypes.string,
  meme: PropTypes.string,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
  sendTransactions: PropTypes.func,
  cancelTransaction: PropTypes.func,
};

export default TransactionCard;
