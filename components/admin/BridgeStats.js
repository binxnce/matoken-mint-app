import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import config from '../../config';
import { BRIDGE_TYPES } from '../../utils/constants';
import { get } from '../../utils/http';
import { addressesEqual, fromWei } from '../../utils/transactions';

const Balance = styled.div`
  padding-left: 20px;
`;

const BridgeStats = () => {
  const topUpContract = useSelector((state) => state.users.current?.topUpContract);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await get(`${config.apiUrl}/bridge/stats`);
      setData(data);
    } catch (e) {
      console.error(e);
      setData(null);
    }
  };

  const receiverLink = (address) => {
    const receiverName = addressesEqual(address, topUpContract.bridgeAddress) ? 'Bridge' : address;
    const url = topUpContract.bcxUrl.replace('/tx/', `/address/${address}`);
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {receiverName}
      </a>
    );
  };

  const bridgeLink = (bridgeAddress) => {
    const url = config.bcxUrl.replace('/tx/', `/address/${bridgeAddress}`);
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        Bridge
      </a>
    );
  };

  if (topUpContract?.type !== BRIDGE_TYPES.MULTI_TOKEN_BRIDGE) return 'Unable to show data for that bridge type';
  if (!data) return 'Loading the data..';

  const columnWidth = 8;
  const {
    processedDeposits24Hours,
    unprocessedDeposits24Hours,
    depositsByStatus24Hours,
    processedDeposits30Days,
    unprocessedDeposits30Days,
    depositsByStatus30Days,
    bridgeNetworkName,
    bridgeNetworkBalances,
    mainNetworkName,
    mainNetworkBridgeAddress,
    mainNetworkBalances,
  } = data;
  const total24HoursDeposits = processedDeposits24Hours + unprocessedDeposits24Hours;
  const total30DaysDeposits = processedDeposits30Days + unprocessedDeposits30Days;

  return (
    <Row>
      <Col lg={4}>
        <div>
          <b>24 Hours stats</b>
        </div>
        <Container>
          <Row>
            <Col lg={columnWidth}>Total deposits</Col>
            <Col>{total24HoursDeposits}</Col>
          </Row>
          <Row>
            <Col lg={columnWidth}>Processed deposits</Col>
            <Col>{processedDeposits24Hours}</Col>
          </Row>
          <Row>
            <Col lg={columnWidth}>Pending deposits</Col>
            <Col>{unprocessedDeposits24Hours}</Col>
          </Row>
          {!!depositsByStatus24Hours && !!Object.keys(depositsByStatus24Hours).length && (
            <>
              <Row>
                <Col lg={columnWidth}>Valid deposits</Col>
                <Col>{depositsByStatus24Hours.valid || 0}</Col>
              </Row>
              <Row>
                <Col lg={columnWidth}>Invalid deposits</Col>
                <Col>{depositsByStatus24Hours.invalid || 0}</Col>
              </Row>
            </>
          )}

          <div>
            <br />
            <b>Last 30 days stats</b>
          </div>
          <Row>
            <Col lg={columnWidth}>Total deposits</Col>
            <Col>{total30DaysDeposits}</Col>
          </Row>
          <Row>
            <Col lg={columnWidth}>Processed deposits</Col>
            <Col>{processedDeposits30Days}</Col>
          </Row>
          <Row>
            <Col lg={columnWidth}>Pending deposits</Col>
            <Col>{unprocessedDeposits30Days}</Col>
          </Row>
          {!!depositsByStatus30Days && !!Object.keys(depositsByStatus30Days).length && (
            <>
              <Row>
                <Col lg={columnWidth}>Valid deposits</Col>
                <Col>{depositsByStatus30Days.valid || 0}</Col>
              </Row>
              <Row>
                <Col lg={columnWidth}>Invalid deposits</Col>
                <Col>{depositsByStatus30Days.invalid || 0}</Col>
              </Row>
            </>
          )}
        </Container>
      </Col>
      <Col lg={8}>
        <div>
          <b>Balances</b>
        </div>
        <br />
        Incoming ({bridgeNetworkName})
        <br />
        {Object.keys(bridgeNetworkBalances).map((receiver, i) => (
          <div key={i}>
            <div>{receiverLink(receiver)}</div>
            {bridgeNetworkBalances[receiver].map(({ symbol, balance }, i) => (
              <Balance key={i}>
                {fromWei(balance)} {symbol}
              </Balance>
            ))}
            <br />
          </div>
        ))}
        Outgoing ({mainNetworkName})<div>{bridgeLink(mainNetworkBridgeAddress)}</div>
        {mainNetworkBalances.map(({ symbol, balance }, i) => (
          <Balance key={i}>
            {fromWei(balance)} {symbol}
          </Balance>
        ))}
        <br />
      </Col>
    </Row>
  );
};

export default BridgeStats;
