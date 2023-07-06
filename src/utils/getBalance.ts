import {
  Pact,
  addSigner,
  commandBuilder,
  createTransaction,
  getClient,
  payload,
  setMeta,
  setProp,
} from '@kadena/client';
import { apiHost } from './apiHost';
import { networkMap } from './networkMap';
import { ChainId, ICommand } from '@kadena/types';

export interface BalanceItem {
  network: keyof typeof networkMap;
  account: string;
  chain: ChainId;
  balance: string;
}

const getHostUrl = (networkId: string, chainId: string): string => {
  switch (networkId) {
    case 'devnet':
      return `http://localhost/${chainId}/pact`;
    case 'l2network':
      return `http://the-l2-server/${chainId}/pact`;
    case 'mainnet01':
      return `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
    case 'testnet04':
      return `https://api.chainweb.com/chainweb/0.0/testnet04/chain/${chainId}/pact`;
    default:
      throw new Error(`UNKNOWN_NETWORK_ID: ${networkId}`);
  }
};

export async function getBalance(
  account: string,
  network: keyof typeof networkMap,
  chainId: ChainId,
): Promise<BalanceItem> {
  const pactCommand = commandBuilder(
    payload.exec((Pact.modules as any).coin['get-balance']),
    setMeta({ sender: account, chainId }),
    setProp('networkId', network),
  );

  const { local, submit, pollStatus, pollSpv: pollSpv } = getClient(getHostUrl);

  const response = await local(createTransaction(pactCommand) as ICommand, {
    signatureValidation: false,
    preflight: false,
  });

  // const response = await pactCommand.local(apiHost(chainId, network), {
  //   signatureVerification: false,
  //   preflight: false,
  // });

  return {
    network,
    account,
    chain: chainId,
    balance: (response.result as any).data,
  };
}
