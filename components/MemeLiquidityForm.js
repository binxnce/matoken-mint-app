import { Tabs as BootstrapTabs, Tab as BootstrapTab } from 'react-bootstrap';
import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import useResizeObserver from 'use-resize-observer';

import config from '../config';
import Form from './Form';
import { FormError } from './FormItem';
import Title from './Title';
import Button from './NeonButton';
import ButtonGroup from './ButtonGroup';
import http from '../utils/http';
import { colors } from '../utils/variables';
import { formatCurrency, pluralize } from '../utils/ui';
import { fromWei, toWei, weiToShards, shardsToWei } from '../utils/transactions';
import { calculateShardsBuyPrice } from '../utils/common';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Reserves = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const FormWrapper = styled.div`
  padding: 20px 10px 0;
`;

const Reserve = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: ${({ isRight }) => (isRight ? 'flex-start' : 'flex-end')};
  flex: 1;
  padding: 40px 10px 30px;
`;

const LabelWrapper = styled.div`
  display: flex;
  padding-left: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Label = styled.p`
  font-size: 14px;
  color: ${colors.secondaryText};
  padding-right: 4px;
  margin-top: 2px;
`;

const Value = styled.p`
  font-size: 16px;
  color: ${colors.main};
`;

const Tabs = styled(BootstrapTabs)`
  && {
    border-bottom: 2px solid ${colors.secondaryText};
    display: flex;
    margin: 0 10px;

    a {
      display: inline-block;
      position: relative;
      margin-bottom: 1px;
      background: transparent;
      border: none !important;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: ${colors.text};
      flex: 1;
      text-align: center;

      &.active,
      &:hover {
        border: none !important;
        color: ${colors.main};
        background: transparent;
      }
    }
  }
`;

const Tab = styled(BootstrapTab)`
  && {
    border: none;
    padding: 20px;
  }
`;

const MinShardsNote = styled.p`
  font-weight: normal;
  font-size: 13px;
  margin-bottom: 20px;
`;

const MaxLabel = ({ value, label }) => {
  return (
    <LabelWrapper>
      <Label>{label && `${label}:`}</Label>
      <Value>{value}</Value>
    </LabelWrapper>
  );
};

MaxLabel.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string.isRequired,
};

function useNumberValue(defaultValue, { integer = false } = {}) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const parsedNumber = integer ? parseInt(inputValue, 10) : parseFloat(inputValue);
  return [Number.isNaN(parsedNumber) ? '' : parsedNumber, setInputValue];
}

const MemeLiquidityForm = (props) => {
  const [ethAmount, setEthAmount] = useNumberValue(0);
  const [withdrawShardsAmount, setWithdrawShardsAmount] = useNumberValue(0);
  const [shardsAmount, setShardsAmount] = useNumberValue(0, { integer: true });
  const [reserves, setReserves] = useState({ eth: '0', memeTokens: '0' });
  const [liquidity, setLiquidity] = useState({ addressLiquidity: '0', tokenAmount: '0', baseTokenAmount: '0' });
  const [error, setError] = useState(undefined);

  const buildSeries = (reserves) => {
    const { maxShards } = props.meme;
    const length = weiToShards(reserves.memeTokens, maxShards) - 1;
    const prices = [];
    const maxDisplayShards = length <= 20 ? length : length - Math.ceil(length * 0.05); // reduce by 5% to avoid exponential pricing
    for (let i = 1; i <= maxDisplayShards; i++) {
      const memeTokens = i / maxShards;
      const price = fromWei(
        calculateShardsBuyPrice(toWei(memeTokens), BigNumber.from(reserves.eth), BigNumber.from(reserves.memeTokens)),
      );
      prices.push(parseFloat(price));
    }
    return prices;
  };

  const [chartData, setChartData] = useState({
    options: {
      chart: { sparkline: { enabled: true } },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      xaxis: { type: 'integer' },
      tooltip: {
        fixed: { enabled: false },
        x: {
          formatter: (val) => pluralize(val, 'shard'),
        },
        y: {
          title: {
            formatter: () => '',
          },
          formatter: (val) => (val ? formatCurrency(val, config.currencySymbol) : ''),
        },
        marker: { show: false },
      },
    },
    series: [{ data: [] }, { data: [] }],
  });

  const { onSuccess, onDismiss, meme, ownership, user } = props;

  let maxEthDeposit = useMemo(() => Number(user?.ethBalanceFormatted || 0), [user]);
  let maxMemeTokenDeposit = useMemo(() => weiToShards(ownership?.memeTokens || 0, props.meme.maxShards), [ownership]);
  let maxTokenWithdraw = useMemo(() => weiToShards(liquidity?.tokenAmount || 0, props.meme.maxShards), [liquidity]);
  let ethToReceive = useMemo(
    () =>
      !!withdrawShardsAmount &&
      maxTokenWithdraw !== 0 &&
      BigNumber.from(liquidity.baseTokenAmount)
        .mul(BigNumber.from(withdrawShardsAmount))
        .div(BigNumber.from(maxTokenWithdraw)),
    [liquidity.baseTokenAmount, withdrawShardsAmount, maxTokenWithdraw],
  );
  const reserveShards = weiToShards(reserves.memeTokens, props.meme.maxShards);
  const minShardsToDeposit = reserveShards === 0 ? 2 : 1;

  const resetTab = () => {
    setEthAmount(0);
    setWithdrawShardsAmount(0);
    setShardsAmount(0);
    setError(undefined);
  };

  useEffect(() => {
    if (!meme || !meme._id) {
      return;
    }
    http
      .get(`${config.apiUrl}/meme/${props.meme._id}/reserves`)
      .then((res) => {
        const reserve = {
          eth: res.data.ethReserve,
          memeTokens: res.data.memeTokenReserve,
        };
        setReserves(reserve);
        updateChartData(reserve);
      })
      .catch(console.error);

    http
      .get(`${config.apiUrl}/me/memes/${props.meme._id}/liquidity`)
      .then((res) => {
        const liquidity = res.data?.liquidity || {};
        setLiquidity({
          addressLiquidity: liquidity.addressLiquidity,
          tokenAmount: liquidity.tokenAmount,
          baseTokenAmount: liquidity.baseTokenAmount,
        });
      })
      .catch(console.error);
  }, [props.meme]);

  const { ref: resizeRef, height } = useResizeObserver();

  useEffect(() => {
    const { updateStepper } = props;
    if (updateStepper) updateStepper();
  }, [error, height]);

  const validateParams = (amount) => {
    if (typeof amount !== 'number') {
      return 'Total Value must be a number';
    }

    if (amount <= 0) {
      return "Total Value can't be zero or less";
    }
  };

  const addLiquidity = () => {
    const error = validateParams(ethAmount) || validateParams(shardsAmount);
    if (error) {
      return setError(error);
    }

    if (shardsAmount < minShardsToDeposit) {
      return setError(`You must deposit at least ${pluralize(minShardsToDeposit, 'shard')}`);
    }

    http
      .post(config.apiUrl + '/meme/add-liquidity', { memeId: props.meme._id, ethAmount, shardsAmount })
      .then(() => {
        onSuccess({ memeId: meme._id });
        resetTab();
      })
      .catch((e) => setError(e?.data?.error?.message || 'unexpected error'));
  };

  const removeLiquidity = () => {
    const error = validateParams(withdrawShardsAmount);
    if (error) {
      return setError(error);
    }
    http
      .post(config.apiUrl + '/meme/remove-liquidity', { memeId: props.meme._id, withdrawShardsAmount })
      .then(() => {
        onSuccess({ memeId: meme._id });
        resetTab();
      })
      .catch((e) => setError(e?.data?.error?.message || 'unexpected error'));
  };

  const updateChartData = (reserve = null, customLiquidity = null) => {
    const line1Data = reserve ? buildSeries(reserve) : chartData.series[0].data;
    let line2Data = chartData.series[1].data;

    if (customLiquidity) {
      const addMemeTokens = shardsToWei(customLiquidity.memeTokens, props.meme.maxShards);
      line2Data = buildSeries({
        eth: BigNumber.from(reserves.eth).add(toWei(customLiquidity.eth)),
        memeTokens: BigNumber.from(reserves.memeTokens).add(addMemeTokens),
      });
    }

    setChartData({
      options: chartData.options,
      series: [
        {
          ...chartData.series[0],
          data: line1Data,
        },
        {
          ...chartData.series[1],
          data: line2Data,
        },
      ],
    });
  };

  return (
    <div ref={resizeRef}>
      <div className="text-center">
        <Reserves>
          <Reserve>
            <Title
              text={Number(fromWei(reserves.eth)).toFixed(3)}
              flickerTimes={{ item2: 6 }}
              secondary
              big
              style={{ margin: 0 }}
            />
            <Title
              text={config.currencySymbol}
              flickerTimes={{ item5: 6 }}
              secondary
              style={{ textTransform: 'none', margin: 0 }}
            />
          </Reserve>
          <Reserve isRight>
            <Title text={reserveShards.toString()} flickerTimes={{ item9: 8 }} big style={{ margin: 0 }} />
            <Title text="Shards" flickerTimes={{ item1: 8 }} style={{ textTransform: 'none', margin: 0 }} />
          </Reserve>
        </Reserves>
      </div>

      <Tabs onSelect={resetTab}>
        <Tab eventKey="add" title="Add">
          <FormWrapper>
            <Form
              style={{ marginTop: 40 }}
              formData={[
                {
                  key: 'balance',
                  label: 'Set total value',
                  type: 'number',
                  min: 1,
                  max: maxEthDeposit,
                  onChange: (e) => {
                    setError(undefined);
                    setEthAmount(e.target.value);
                    if (e.target.value !== '') {
                      updateChartData(null, {
                        eth: e.target.value,
                        memeTokens: shardsAmount,
                      });
                    }
                  },
                  value: ethAmount,
                  labelAddon: (
                    <MaxLabel label="" value={formatCurrency(user.ethBalanceFormatted, config.currencySymbol)} />
                  ),
                },
                {
                  key: 'memeT',
                  label: 'Deposit shards',
                  type: 'number',
                  min: minShardsToDeposit,
                  max: maxMemeTokenDeposit,
                  onChange: (e) => {
                    setError(undefined);
                    const shards = e.target.value;
                    setShardsAmount(shards);
                    updateChartData(null, {
                      eth: ethAmount,
                      memeTokens: e.target.value,
                    });
                  },
                  value: shardsAmount,
                  labelAddon: <MaxLabel label="" value={`${maxMemeTokenDeposit} shards `} />,
                },
              ]}
            />
            {error && <FormError center>{error}</FormError>}
            <MinShardsNote>
              Note: there should always be at least 1 shard in the pool to keep the meme active. That 1 shard gets
              reserved, so no-one will be able to buy it, but you could always get it back once you decide to completely
              remove the liquidity.
            </MinShardsNote>
          </FormWrapper>
          <Title text="Price change chart" extraSmall />
          <Chart type="area" height={200} series={chartData.series} options={chartData.options} />
          <ButtonGroup center style={{ padding: 20 }}>
            <Button tertiary big text="Cancel" onClick={onDismiss} />
            <Button onClick={addLiquidity} main big text="Add" />
          </ButtonGroup>
        </Tab>
        <Tab eventKey="remove" title="Remove">
          <Form
            style={{ marginTop: 40 }}
            formData={[
              {
                key: 'returnLiquidity',
                label: 'Withdraw shards',
                type: 'number',
                min: 1,
                max: maxTokenWithdraw,
                onChange: (e) => {
                  setError(undefined);
                  setWithdrawShardsAmount(e.target.value);
                },
                value: withdrawShardsAmount,
                labelAddon: <MaxLabel label="max" value={maxTokenWithdraw} />,
                withSlider: true,
              },
            ]}
          />
          <p>
            You&apos;ll receive {withdrawShardsAmount > 0 && '~'}
            {formatCurrency(fromWei(ethToReceive), config.currencySymbol)}
          </p>
          {error && <FormError center>{error}</FormError>}
          <ButtonGroup center style={{ padding: 20 }}>
            <Button tertiary big text="Cancel" onClick={onDismiss} />
            <Button onClick={removeLiquidity} secondary big text="Remove" />
          </ButtonGroup>
        </Tab>
      </Tabs>
    </div>
  );
};

MemeLiquidityForm.propTypes = {
  isShown: PropTypes.bool,
  onHide: PropTypes.func,
  meme: PropTypes.object.isRequired,
  ownership: PropTypes.object,
  user: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  updateStepper: PropTypes.func,
  onDismiss: PropTypes.func.isRequired,
};

export default MemeLiquidityForm;
