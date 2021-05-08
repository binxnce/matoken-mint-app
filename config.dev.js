import { EnvNames } from 'etherspot';

const config = {
  webUrl: 'https://localhost:7777',
  apiUrl: 'https://localhost:7777/api',
  socketsServerUrl: '',
  storageUrl: '', // http://localhost:3010/storage
  categories: ['funny', 'gif', 'animals', 'savage', 'gaming'],
  chainId: 100,
  bcxUrl: 'https://blockscout.com/poa/xdai/tx/',
  mainToken: null,
  mainTokenTicker: null,
  mainTokenDetails: null,
  currencySymbol: '$',
  mixpanelKey: '',
  mixpanelHost: '',
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
