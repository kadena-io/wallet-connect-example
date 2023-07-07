// @TODO should be exported from @kadena/client

export const getHostUrl = (networkId: string, chainId: string): string => {
  switch (networkId) {
    case 'mainnet01':
      return `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
    case 'testnet04':
      return `https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/${chainId}/pact`;
    default:
      throw new Error(`UNKNOWN_NETWORK_ID: ${networkId}`);
  }
};
