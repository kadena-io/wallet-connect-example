interface INetworks {
  mainnet01: { name: "mainnet"; api: "api.chainweb.com" };
  testnet04: {
    name: "testnet";
    api: "api.testnet.chainweb.com";
  };
}

export const networkMap: INetworks = {
  mainnet01: { name: "mainnet", api: "api.chainweb.com" },
  testnet04: { name: "testnet", api: "api.testnet.chainweb.com" },
} as const;
