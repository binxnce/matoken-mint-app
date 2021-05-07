import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import moment from 'moment';

import { colors, media } from '../utils/variables';
import { TRANSACTION_GROUP_STATUS } from '../utils/constants';
import { calculateTotalValuation, formatCurrency } from '../utils/ui';
import { fromWei, weiToShards } from '../utils/transactions';
import http from '../utils/http';
import config from '../config';

import MemeImage from './MemeImage';
import Card from './Card';
import Button from './NeonButton';
import ButtonGroup from './ButtonGroup';
import Tooltip from './Tooltip';
import Tags from './Tags';
import MemeLink from './MemeLink';

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${Card.PADDING};
`;

const CardRow = styled(Row)`
  margin: 0 -6px;
  align-items: center;
`;

const CardColumn = styled(Col)`
  padding: 6px;
`;

const CardMemeImage = styled(MemeImage)`
  width: 300px;
  align-self: center;
`;

const CardTitle = styled.h6`
  text-transform: none;
  font-weight: 500;
  color: ${colors.text};
  margin: 0;
  font-size: 26px;
`;

const Label = styled.p`
  text-transform: none;
  font-weight: 400;
  color: ${colors.secondaryText};
  font-size: 10px;
  margin: 0;
`;

const TokenValue = styled.p`
  font-size: 20px;
  font-weight: 500;
  color: ${colors.text};
  margin: 16px 0 0;
  line-height: 1;
  white-space: nowrap;
`;

const TokenName = styled.p`
  font-size: 14px;
  color: ${colors.text};
  margin: 0;
  line-height: 1;
`;

const ViewMemeButton = styled(Button)`
  ${({ turnToBlock }) =>
    turnToBlock &&
    `@media ${media.max.laptop} {
    display: flex;
    justify-content: center;
  }`}
`;

const PendingLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 4px;
`;

const PendingLabel = styled.p`
  color: ${colors.secondaryText};
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 1px;
`;

const SecondaryText = styled.span`
  color: ${colors.secondary};
`;

const ManagementButtons = (props) => {
  const { ownership, manageLiquidity, memeId } = props;
  if (ownership && memeId) {
    return (
      <ButtonGroup>
        <MemeLink memeId={memeId}>
          <Button main text="Buy more" />
        </MemeLink>
        <MemeLink memeId={memeId}>
          <Button secondary text="Sell" />
        </MemeLink>
      </ButtonGroup>
    );
  }

  return (
    <ButtonGroup>
      <Button main text="Manage liquidity" onClick={manageLiquidity} block />
    </ButtonGroup>
  );
};

ManagementButtons.propTypes = {
  ownership: PropTypes.object,
  manageLiquidity: PropTypes.func,
  memeId: PropTypes.string,
};

const getFormattedValue = (value) => {
  if (!value) return null;
  const parts = value.toString().split('.');
  const isShortened = parts[1]?.length > 3;
  const trimmedValue = parts[1] ? `${parts[0]}.${parts[1].slice(0, 3)}` : parts[0];
  return {
    value: Number(trimmedValue).toFixed(3),
    isShortened,
  };
};

const Value = ({ value: valueInWei = '0', symbol }) => {
  const value = fromWei(valueInWei);
  const { value: formattedValue = '0.000', isShortened } = getFormattedValue(value) || {};
  const displayValue = symbol ? formatCurrency(formattedValue, symbol) : formattedValue;
  if (isShortened) {
    return (
      <Tooltip tooltipContent={<p>{value}</p>} triggerComponent={<TokenValue style={{ height: 4 }}>...</TokenValue>}>
        <TokenValue>{displayValue}</TokenValue>
      </Tooltip>
    );
  }
  return <TokenValue>{displayValue}</TokenValue>;
};

Value.propTypes = {
  value: PropTypes.string,
  symbol: PropTypes.string,
};

const ShardsAmount = ({ amount: amountInWei = '0', maxShards }) => {
  const displayAmount = weiToShards(amountInWei, maxShards);
  return <TokenValue>{displayAmount}</TokenValue>;
};

ShardsAmount.propTypes = {
  amount: PropTypes.string.isRequired,
  maxShards: PropTypes.number.isRequired,
};

const MemeInfoCard = (props) => {
  const {
    title,
    createdAt,
    category,
    tags,
    enabled,
    isArchived,
    _id,
    manageLiquidity,
    editMemeDetails,
    toTransactions,
    availableShards = 0,
    ethLiquidity,
    memeTokens,
    maxShards,
    ownership,
    priceToBuy,
    transactionStatus,
  } = props;

  let totalValuation;
  if (ownership) {
    const amount = weiToShards(memeTokens, maxShards);
    totalValuation = calculateTotalValuation(amount, priceToBuy);
  } else {
    totalValuation = calculateTotalValuation(maxShards, priceToBuy);
  }

  const reRegisterMeme = () => {
    http
      .post(`${config.apiUrl}/meme/re-register-meme/${_id}`)
      .then(() => toTransactions())
      .catch(({ data }) => {
        alert(data?.error?.message || 'Unexpected error occurred, please try again later');
        console.error(data);
      });
  };

  return (
    <Card style={{ marginTop: 12 }} bodyWrapperStyle={{ padding: 0, display: 'flex' }}>
      <CardMemeImage meme={props} />
      <MainContent>
        <CardRow style={{ alignItems: 'flex-end', flexGrow: 1 }}>
          <CardColumn lg={8} md={12}>
            <CardTitle>{title}</CardTitle>
            <Label>
              {moment(createdAt)
                .utc(true)
                .format('MM DD YYYY H:mm:ss')}{' '}
              &#8226; {category}
            </Label>
            {!!tags && <Tags tags={tags} />}
            {!!ownership && (
              <Label style={{ marginTop: 4 }}>
                Owned since{' '}
                <SecondaryText>
                  {moment(ownership.createdAt)
                    .utc(true)
                    .format('MM DD YYYY H:mm:ss')}
                </SecondaryText>
              </Label>
            )}
          </CardColumn>
          <CardColumn lg={4} md={12}>
            {!!enabled && (
              <>
                <Row>
                  <Col>Shards info:</Col>
                </Row>
                <Row>
                  <Col lg={12} md={6} sm={6} xs={12}>
                    {ownership && (
                      <>
                        <ShardsAmount amount={memeTokens} maxShards={maxShards} />
                        <TokenName>Shards</TokenName>
                      </>
                    )}
                    {!ownership && (
                      <>
                        <TokenValue>{maxShards}</TokenValue>
                        <TokenName>Total shards</TokenName>
                      </>
                    )}
                  </Col>
                  <Col lg={12} md={6} sm={6} xs={12}>
                    <Value value={totalValuation.toString()} symbol={config.currencySymbol} />
                    <TokenName>Total value</TokenName>
                  </Col>
                </Row>
              </>
            )}
            {!!enabled && !ownership && (
              <>
                <Row>
                  <Col>
                    <br />
                    Liquidity:
                  </Col>
                </Row>
                <Row>
                  <Col lg={12} md={6} sm={6} xs={12}>
                    <TokenValue>{availableShards ? availableShards + 1 : 0} shards</TokenValue>
                  </Col>
                  <Col lg={12} md={6} sm={6} xs={12}>
                    <Value value={ethLiquidity} symbol={config.currencySymbol} />
                  </Col>
                </Row>
              </>
            )}
          </CardColumn>
        </CardRow>
        <CardRow style={{ paddingTop: 20 }}>
          <CardColumn lg={8} md={6} sm={12} xs={12}>
            <ButtonGroup>
              {enabled && !isArchived && (
                <MemeLink memeId={_id}>
                  <ViewMemeButton tertiary text="View meme" turnToBlock={!ownership} />
                </MemeLink>
              )}
              {!ownership && <Button main text="Edit meme" onClick={editMemeDetails} block />}
            </ButtonGroup>
          </CardColumn>
          <CardColumn lg={4} md={6} sm={12} xs={12}>
            {enabled && !isArchived && (
              <ManagementButtons ownership={ownership} manageLiquidity={manageLiquidity} memeId={_id} />
            )}
            {transactionStatus === TRANSACTION_GROUP_STATUS.CREATED && (
              <>
                <PendingLabelWrapper>
                  <Tooltip
                    tooltipContent={
                      <p>
                        To make meme tradable and visible to others
                        <br /> you need to sign some actions
                      </p>
                    }
                  >
                    <PendingLabel>PENDING</PendingLabel>
                  </Tooltip>
                </PendingLabelWrapper>
                <Button secondary text="Finish signing" block onClick={toTransactions} />
              </>
            )}
            {transactionStatus === TRANSACTION_GROUP_STATUS.FAILED && (
              <>
                <PendingLabelWrapper>
                  <Tooltip
                    tooltipContent={
                      <p>
                        Some error happened while registering your meme
                        <br />
                        Please try again
                      </p>
                    }
                  >
                    <PendingLabel>FAILED TO REGISTER</PendingLabel>
                  </Tooltip>
                </PendingLabelWrapper>
                <Button secondary text="Register again" block onClick={reRegisterMeme} />
              </>
            )}
          </CardColumn>
        </CardRow>
      </MainContent>
    </Card>
  );
};

MemeInfoCard.propTypes = {
  title: PropTypes.string,
  createdAt: PropTypes.string,
  category: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool,
  isArchived: PropTypes.bool,
  _id: PropTypes.string,
  manageLiquidity: PropTypes.func,
  editMemeDetails: PropTypes.func,
  toTransactions: PropTypes.func,
  availableShards: PropTypes.number,
  ethLiquidity: PropTypes.string,
  memeTokens: PropTypes.string,
  priceToBuy: PropTypes.string,
  maxShards: PropTypes.number,
  ownership: PropTypes.object,
  transactionStatus: PropTypes.string,
};

export default MemeInfoCard;
