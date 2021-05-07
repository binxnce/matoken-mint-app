import React from 'react';
import dynamic from 'next/dynamic';
import moment from 'moment';
import styled from 'styled-components';

import { memePropType } from '../utils/memes';
import { calculateTotalValuation, formatPrice } from '../utils/ui';

import MemeInfoPrice from './MemeInfoPrice';
import MemeInfoWrapper, { InfoRow, FullWidthContent } from './MemeInfoWrapper';

const ChartWrapper = styled(FullWidthContent)`
  padding-bottom: 20px;
`;

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const priceChartOptions = {
  chart: {
    sparkline: { enabled: true },
  },
  stroke: { curve: 'smooth' },
  yaxis: { type: 'string' },
  xaxis: { type: 'datetime' },
  tooltip: {
    fixed: { enabled: false },
    x: {
      formatter: (val) => moment(val).format('YYYY MM DD hh') + ':00',
    },
    y: {
      title: {
        formatter: () => '',
      },
      formatter: (val) => (val ? formatPrice(val.toString()) : ''),
    },
    marker: { show: false },
  },
};

const MemePriceDetails = ({ meme }) => {
  const showPrice = meme.priceToBuy && meme.priceToBuy !== '0';
  const availableShards = meme.availableShards ?? 0;
  const totalValuation = calculateTotalValuation(meme.maxShards, meme.priceToBuy);

  const chartData = meme.priceDataset.xAxis.map((val, i) => [val, meme.priceDataset.yAxis[i]]);
  const priceChartSeries = [{ data: chartData }];
  const showChart = meme.priceDataset?.xAxis?.length > 2;

  return (
    <MemeInfoWrapper meme={meme}>
      {!!totalValuation && <InfoRow label="Total valuation">{formatPrice(totalValuation)}</InfoRow>}
      <InfoRow label="Shards available">
        {availableShards}/{meme.maxShards}
      </InfoRow>

      {showPrice && (
        <MemeInfoPrice className="my-auto py-3" price={meme.priceToBuy} priceChange={meme.memePriceChange} />
      )}

      {showChart && (
        <ChartWrapper>
          <Chart type="line" height={200} series={priceChartSeries} options={priceChartOptions} />
        </ChartWrapper>
      )}
    </MemeInfoWrapper>
  );
};

MemePriceDetails.propTypes = {
  meme: memePropType.isRequired,
};

export default MemePriceDetails;
