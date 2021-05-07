import { EnvNames } from 'etherspot';

const config = {
  webUrl: 'https://matokenswap.pillarproject.io',
  apiUrl: 'https://matokenswap.pillarproject.io/api',
  socketsServerUrl: 'https://matokenswap.pillarproject.io',
  storageUrl: 'https://d1dogjlgz8ks8z.cloudfront.net',
  categories: ['funny', 'gif', 'animals', 'savage', 'gaming'],
  chainId: 100,
  bcxUrl: 'https://blockscout.com/poa/xdai/tx/',
  mainToken: null,
  mainTokenTicker: null,
  mainTokenDetails: null,
  currencySymbol: '$',
  mixpanelKey: '337616d8e33fd325034cd388eb63c3e2',
  mixpanelHost: 'https://api-eu.mixpanel.com',
  production: true,
  etherspot: {
    projectKey: 'dank-xdai',
    networkName: 'xdai',
    env: EnvNames.MainNets,
  },
  displayPrecisions: {
    ETH: 5,
    BNB: 3,
    $: 3,
    DAI: 3,
  },
};

export default config;
