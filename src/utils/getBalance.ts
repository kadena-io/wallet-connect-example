import { PactCommand } from '@kadena/client';
import { apiHost } from './apiHost';
import { networkMap } from './networkMap';
import { ChainId } from '@kadena/types';

export interface BalanceItem {
  network: keyof typeof networkMap;
  account: string;
  chain: ChainId;
  balance: string;
}

export async function getBalance(
  account: string,
  network: keyof typeof networkMap,
  chainId: ChainId,
): Promise<BalanceItem> {
  const pactCommand = new PactCommand();

  pactCommand.code = `(coin.get-balance "${account}")`;
  pactCommand.setMeta({ sender: account, chainId }, network);

  const response = await pactCommand.local(apiHost(chainId, network), {
    signatureVerification: false,
    preflight: false,
  });

  return {
    network,
    account,
    chain: chainId,
    balance: response.result.data,
  };
}
