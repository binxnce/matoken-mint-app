import { EnvNames } from 'etherspot';

const config = {
  webUrl: 'https://memes.pillarproject.io',
  apiUrl: 'https://memes.pillarproject.io/api',
  socketsServerUrl: 'https://memes.pillarproject.io',
  storageUrl: 'https://d1dogjlgz8ks8z.cloudfront.net',
  categories: ['funny', 'gif', 'animals', 'savage', 'gaming'],
  chainId: 56,
  bcxUrl: 'https://bscscan.com/tx/',
  mainToken: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // put token's address here or null for the main network's currency (ETH)
  mainTokenTicker: 'DAI', // set token's ticker, e.g. DAI
  mainTokenDetails: 'https://bscscan.com/token/0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // link to token details, e.g. https://bscscan.com/token/0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3
  currencySymbol: '$',
  production: true,
  mixpanelKey: '337616d8e33fd325034cd388eb63c3e2',
  mixpanelHost: 'https://api-eu.mixpanel.com',
  etherspot: {
    projectKey: 'dank-bsc',
    networkName: 'bsc',
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
