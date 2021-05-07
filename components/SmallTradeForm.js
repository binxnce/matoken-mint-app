import React, { useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { Form, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';

import config from '../config';
import http from '../utils/http';
import { fromWei, prependAllowanceTransactions, weiToShards, cancelTransaction } from '../utils/transactions';
import { formatCurrency } from '../utils/ui';
import serviceContext from '../services/serviceContext';
import useMemeOwnership from '../hooks/useMemeOwnership';
import { fontSize, fontWeight } from '../utils/variables';

import { SellButton, BuyButton } from './TradeButtons';
import InsufficientBalanceModal from './InsufficientBalanceModal';

export const TRADE_TYPE = {
  BUY: 'BUY',
  SELL: 'SELL',
};

const TextControlGroup = styled(Form.Group)`
  display: flex;
  align-items: center;

  input {
    order: 1;
    min-width: 0;
    margin-right: 10px;
    padding: 0;
    border: none;
    font-size: ${fontSize.xxl};
    font-weight: ${fontWeight.bold};
    text-align: right;

    &:focus {
      color: #000000;
      outline: none;
      box-shadow: none;
    }

    /* hide the spin box */
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  label {
    order: 2;
    margin: 0;
    font-size: ${fontSize.s};
    font-weight: ${fontWeight.bold};
    color: #666666;
  }
`;

const ButtonEstimate = styled.span`
  font-size: 0.7em;
  margin-top: 5px;
  display: block;
`;

// range input styles based on
// https://css-tricks.com/styling-cross-browser-compatible-range-inputs-css/
// (see the article for explanations for non-obvious declarations)
//
// selectors grouping multiple vendor prefixes aren't recognized, so some styles
// are repeated manually

const createRangeInputThumbStyle = (styles) => `
  &::-webkit-slider-thumb {
    ${styles}
  }
  &::-moz-range-thumb {
    ${styles}
  }
  &::-ms-thumb {
    ${styles}
  }
`;

const createRangeInputTrackStyle = (styles) => `
  &::-webkit-slider-runnable-track {
    ${styles}
  }
  &::-moz-range-track {
    ${styles}
  }
  &::-ms-track {
    ${styles}
  }
`;

const RangeInput = styled(Form.Control).attrs(() => ({ type: 'range' }))`
  /* 1. reset */

  -webkit-appearance: none;
  width: 100%;
  background: transparent;
  margin-bottom: 27px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    margin-top: -11px;
  }

  ::-ms-track {
    width: 100%;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }

  &:focus {
    outline: none;
  }

  /* 2. thumb */

  ${createRangeInputThumbStyle(`
    background: #ffffff;
    width: 32px;
    height: 32px;
    border-radius: 100%;
    box-shadow: 0 5px 14px 0 rgba(0, 0, 0, 0.5);
    cursor: pointer;
  `)}

  &:focus {
    ${createRangeInputThumbStyle(`
      box-shadow: 0 5px 14px 0 rgba(0, 0, 0, 0.7);
    `)}
  }

  /* 3.track */

  ${createRangeInputTrackStyle(`
    width: 100%;
    height: 11px;
    cursor: pointer;
    background: #000000;
    border-radius: 5.5px;
  `)}

  &:focus {
    ${createRangeInputTrackStyle(`
      box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.25);
    `)}
  }
`;

const useTradeEstimate = ({ type, memeId, numberOfShards }) => {
  const [estimate, setEstimate] = useState({ shards: null, price: null });

  const updateEstimate = useCallback(
    debounce(async (numberOfShards) => {
      if (numberOfShards === 0) return;
      const requestUrl = `${config.apiUrl}/meme/${memeId}/${type === TRADE_TYPE.BUY ? 'cost' : 'receive'}-estimate`;
      try {
        const response = await http.post(requestUrl, { amount: numberOfShards });
        setEstimate({
          shards: numberOfShards,
          price: Number(fromWei(response.data.estimate)) || null,
        });
      } catch (error) {
        setEstimate({
          shards: numberOfShards,
          price: null,
          error: error.data?.error?.message ?? "Couldn't get price estimate",
        });
      }
    }, 500),
    [memeId, type],
  );

  useEffect(() => {
    updateEstimate(numberOfShards);
  }, [numberOfShards, updateEstimate]);

  return estimate;
};

const submitButtons = {
  [TRADE_TYPE.BUY]: {
    ButtonComponent: BuyButton,
    label: 'Buy',
  },
  [TRADE_TYPE.SELL]: {
    ButtonComponent: SellButton,
    label: 'Sell',
  },
};

const SmallTradeForm = ({ type, meme, onSuccess = noop }) => {
  const memeId = meme._id;
  const ownership = useMemeOwnership(memeId);
  const maxShards =
    (type === TRADE_TYPE.BUY ? meme.availableShards : weiToShards(ownership?.memeTokens, meme.maxShards)) || 0;
  const userBalance = useSelector((state) => Number(state.users.current?.ethBalanceFormatted || 0));

  const [numberOfShardsInput, setNumberOfShardsInput] = useState('1');
  const onShardsControlChange = useCallback((event) => {
    setNumberOfShardsInput(event.target.value);
  }, []);
  const numberOfShards = parseInt(numberOfShardsInput) || 0;

  const estimate = useTradeEstimate({ type, memeId, numberOfShards });

  const controlCommonProps = {
    onChange: onShardsControlChange,
    min: 1,
    max: maxShards,
    step: 1,
  };

  const isBalanceTooLow = type === TRADE_TYPE.BUY && estimate.price !== null && estimate.price > userBalance;
  const [isBalanceErrorModalShown, setIsBalanceErrorModalShown] = useState(false);

  const validateForm = () => {
    if (numberOfShards <= 0) {
      return 'Amount too small';
    }
    if (numberOfShards > maxShards) {
      return 'Amount too big';
    }
    if (isBalanceTooLow) {
      return "You don't have enough balance";
    }

    return null;
  };

  const [error, setError] = useState(null);
  const { sdkService } = useContext(serviceContext);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitTrade = async (event) => {
    event.preventDefault();

    let txGroupId;
    const error = validateForm();
    setError(error);
    if (isBalanceTooLow) setIsBalanceErrorModalShown(true);
    if (error !== null || estimate.shards !== numberOfShards || estimate.price === null) return;

    try {
      setIsSubmitted(true);
      const {
        data: { transactionGroup: txGroup },
      } = await http.post(`${config.apiUrl}/meme/${type === TRADE_TYPE.BUY ? 'buy' : 'sell'}`, {
        memeId,
        amount: numberOfShards,
      });
      if (!txGroup?.transactions.length) return;

      txGroupId = txGroup._id;
      let transactionsToSubmit = prependAllowanceTransactions(txGroup.transactions);
      await sdkService.sendTransactions(transactionsToSubmit, txGroup._id);
      onSuccess({ type, shards: numberOfShards });
    } catch (error) {
      setError(error?.data?.error?.message || error?.message || 'unexpected error');
      if (txGroupId) {
        cancelTransaction(txGroupId);
      }
      setIsSubmitted(false);
    }
  };

  const errorMessage = error ?? (estimate.shards === numberOfShards && estimate.error ? estimate.error : null);
  const { ButtonComponent, label } = submitButtons[type];

  return (
    <Form onSubmit={submitTrade}>
      <Form.Group controlId="no_shards_range">
        <Form.Label srOnly>shards</Form.Label>
        <RangeInput value={numberOfShards} {...controlCommonProps} />
      </Form.Group>
      <TextControlGroup controlId="no_shards_text">
        <Form.Label>shards</Form.Label>
        <Form.Control type="number" value={numberOfShardsInput} {...controlCommonProps} />
      </TextControlGroup>
      {errorMessage !== null && <Alert variant="danger">{errorMessage}</Alert>}

      <div className="d-flex flex-column">
        {/* checking the truthiness of numberOfShardsInput keeps the old button
            label when the value in the text field is deleted,
            until a new one is entered */}
        {numberOfShardsInput && estimate.shards !== numberOfShards ? (
          <ButtonComponent type="submit" disabled>
            {label}
            <ButtonEstimate>Getting estimate...</ButtonEstimate>
          </ButtonComponent>
        ) : estimate.price === null ? (
          <ButtonComponent type="submit" disabled>
            {label}
          </ButtonComponent>
        ) : (
          <ButtonComponent type="submit" disabled={isSubmitted}>
            {label}
            <ButtonEstimate>for {formatCurrency(estimate.price, config.currencySymbol)}</ButtonEstimate>
          </ButtonComponent>
        )}
      </div>
      <InsufficientBalanceModal show={isBalanceErrorModalShown} onHide={() => setIsBalanceErrorModalShown(false)} />
    </Form>
  );
};

SmallTradeForm.propTypes = {
  type: PropTypes.oneOf([TRADE_TYPE.BUY, TRADE_TYPE.SELL]).isRequired,
  meme: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};

export default SmallTradeForm;
