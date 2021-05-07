import { EnvNames } from 'etherspot';

const config = {
  webUrl: 'https://meme-qa.pillarproject.io',
  apiUrl: 'https://meme-qa.pillarproject.io/api',
  socketsServerUrl: 'https://meme-qa.pillarproject.io',
  storageUrl: 'https://d3mb2y8bvgq5gu.cloudfront.net',
  categories: ['funny', 'gif', 'animals', 'savage', 'gaming'],
  chainId: 5, // goerli
  bcxUrl: 'https://goerli.etherscan.io/tx/',
  mainToken: null, // put token's address here or null for the main network's currency (ETH)
  mainTokenTicker: null, // set token's ticker, e.g. DAI
  mainTokenDetails: null, // link to token details, e.g. https://bscscan.com/token/0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3
  currencySymbol: 'ETH',
  production: true,
  mixpanelKey: '1d802523980d6dc497c233b1da8cda8b',
  mixpanelHost: 'https://api-eu.mixpanel.com',
  etherspot: {
    projectKey: 'dank-qa',
    networkName: 'goerli',
    env: EnvNames.TestNets,
  },
  displayPrecisions: {
    ETH: 5,
    BNB: 3,
    $: 3,
    DAI: 3,
  },
};

export default config;
