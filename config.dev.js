import { EnvNames } from 'etherspot';

const config = {
  webUrl: 'http://localhost:7777',
  apiUrl: 'http://localhost:7777',
  socketsServerUrl: 'http://localhost:7777',
  storageUrl: 'http://localhost:7777',
  categories: ['Rock', 'Blues', 'Metal', 'Pop'],
  chainId: 80001,
  bcxUrl: 'https://explorer-mumbai.maticvigil.com/tx/',
  mainToken: null,
  mainTokenTicker: null,
  mainTokenDetails: null,
  currencySymbol: '$',
  mixpanelKey: '337616d8e33fd325034cd388eb63c3e2',
  mixpanelHost: 'https://api-eu.mixpanel.com',
  production: true,
  etherspot: {
    projectKey: 'matokenswap-mint',
    networkName: 'mumbai',
    env: EnvNames.MainNets,
  },
  displayPrecisions: {
    ETH: 5,
    MATIC: 3,
    $: 3,
    DAI: 3,
  },
};

export default config;
