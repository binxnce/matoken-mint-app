const contracts = require('@matoken/contracts');
module.exports = (config) => ({
  // web3
  ethProvider: process.env.ETH_PROVIDER,//Mumbai as the default
  chainId: 80001,
  web3Addresses: {
    dispenser: contracts.ERC1155.address, //TODO
    weth: contracts.WrappedERC20.address, //TODO
    memeMinter: contracts.ERC721.address, //TODO
    factory: contracts.UniswapV2Factory.address, //TODO
    router: contracts.UniswapV2Router.address, //TODO
  },
  mainToken: null, // null for the main network currency (ETH)

  etherspot: {
    projectAddress: process.env.PROJECT_ADDRESS,
    projectPrivateKey: process.env.PROJECT_PRIVATE_KEY,
    networkName: 'localA',
    env: EnvNames.LocalNets,
  },

  indexer: {
    enable: false,
    blocksInterval: 3000, // 3 sec.
    blocksToProcessAtOnce: 25,
    delayBlocks: 0,
  },
});