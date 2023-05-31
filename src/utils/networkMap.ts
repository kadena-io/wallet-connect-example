interface INetworks {
  mainnet01: { name: 'mainnet'; api: 'api.chainweb.com' };
  testnet04: {
    name: 'testnet';
    api: 'api.testnet.chainweb.com';
  };
  development: { name: 'development'; api: 'localhost:8080' };
}

export const networkMap: INetworks = {
  mainnet01: { name: 'mainnet', api: 'api.chainweb.com' },
  testnet04: { name: 'testnet', api: 'api.testnet.chainweb.com' },
  development: { name: 'development', api: 'localhost:8080' },
} as const;
