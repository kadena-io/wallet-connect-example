import {
  IPactCommand,
  Pact,
  commandBuilder,
  createTransaction,
  getClient,
  payload,
  setMeta,
  setProp,
} from '@kadena/client';
import { ChainId } from '@kadena/types';
import { getHostUrl } from './getHostUrl';

export interface BalanceItem {
  network: IPactCommand['networkId'];
  account: string;
  chain: ChainId;
  balance: string;
}

export async function getBalance(
  account: string,
  network: IPactCommand['networkId'],
  chainId: ChainId,
): Promise<BalanceItem> {
  const pactCommand = commandBuilder(
    payload.exec((Pact.modules as any).coin['get-balance'](account)),
    setMeta({ sender: account, chainId }),
    setProp('networkId', network),
  );

  pactCommand.signers = []; // @TODO remove

  const { local } = getClient(getHostUrl);

  const transaction = createTransaction(pactCommand);

  const response = await local(transaction, {
    signatureValidation: false,
    preflight: false,
  });

  return {
    network,
    account,
    chain: chainId,
    balance: (response.result as any).data,
  };
}
