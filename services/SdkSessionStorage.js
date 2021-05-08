const sdkSessionStorage = {
  getSession: async (walletAddress) => {
    let result = null;
    if (!walletAddress) {
      return result;
    }

    try {
      const raw = localStorage.getItem(`${walletAddress}:session`);
      result = JSON.parse(raw) || null;
    } catch (err) {
      //
    }

    return result;
  },
  setSession: async (walletAddress, session) => {
    if (walletAddress) {
      localStorage.setItem(`${walletAddress}:session`, JSON.stringify(session));
    }
  },
};

export default sdkSessionStorage;
