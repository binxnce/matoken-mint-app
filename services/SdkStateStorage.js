const sdkStateStorage = {
  getState: async (walletAddress, networkName) => {
    let result = null;
    if (!walletAddress || !networkName) {
      return result;
    }

    try {
      const raw = localStorage.getItem(`${walletAddress}:${networkName}`);
      result = JSON.parse(raw) || null;
    } catch (err) {
      //
    }

    return result;
  },
  setState: async (walletAddress, networkName, state) => {
    if (walletAddress && networkName) {
      localStorage.setItem(`${walletAddress}:${networkName}`, JSON.stringify(state));
    }
  },
};

export default sdkStateStorage;
