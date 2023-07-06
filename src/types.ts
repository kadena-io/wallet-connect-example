import { ChainId, ISigningCap } from '@kadena/types';
import { networkMap } from './utils/networkMap';
import { IPactCommand } from '@kadena/client';

/**
 * This is the interface for the signing request that is sent to the wallet.
 * It differs from the type in @kadena/types. When that is updated, we should
 * use that type instead.
 */
export interface ISigningRequest {
  code: string;
  data?: Object;
  caps: ISigningCap[];
  nonce?: string;
  chainId?: ChainId;
  gasLimit?: number;
  gasPrice?: number;
  ttl?: number;
  sender?: string;
  extraSigners?: string[];
}

export interface IWalletConnectAccount {
  account: string;
  publicKey: string;
  contracts?: string[];
  kadenaAccounts: [
    {
      name: string;
      chains: ChainId[];
      contract: string;
    },
  ];
}

export interface IAccount {
  walletConnectChainId: TWalletConnectChainId;
  publicKey: IWalletConnectAccount['publicKey'];
  network: IPactCommand['networkId']; // Kadena network (mainnet, testnet, devnet)
  account: string; // Kadena account
  chainId: ChainId; // Kadena ChainId
}

export type TSigningType = 'sign' | 'quicksign';

export type TWalletConnectChainId = `kadena:${keyof typeof networkMap}`; //kadena:mainnet01, kadena:testnet04, kadena:development
