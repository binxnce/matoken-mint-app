import { EnvNames } from 'etherspot';

const config = {
  webUrl: 'https://tibeb.io',
  apiUrl: 'https://tibeb.io/api',
  socketsServerUrl: 'https://tibeb.io',
  storageUrl: 'https://pillar-prod-tibeb-memes.s3.eu-west-2.amazonaws.com',
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
    projectKey: 'tibeb-xdai',
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
