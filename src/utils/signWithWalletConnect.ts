import { SessionTypes } from '@walletconnect/types';
import Client from '@walletconnect/sign-client';
import { ISigningRequest, TWalletConnectChainId } from '@/types';
import { ICommand, PactCode } from '@kadena/types';
import { ISignFunction, ISignSingleFunction } from './ISignFunction';
import { PactCommand } from '@kadena/client';

interface ISigningResponse {
  body: ICommand;
}

export function createWalletConnectSign(
  client: Client,
  session: SessionTypes.Struct,
  walletConnectChainId: TWalletConnectChainId,
) {
  const signWithWalletConnect: ISignSingleFunction = async (transaction) => {
    const signingRequest: ISigningRequest = {
      code: transaction.code,
      data: transaction.data,
      caps: transaction.signers.flatMap((signer) =>
        signer.caps.map(({ name, args }) => {
          const nameArr = name.split('.');

          return {
            role: nameArr[nameArr.length - 1],
            description: `Description for ${name}`,
            cap: {
              name,
              args,
            },
          };
        }),
      ),
      nonce: transaction.nonce,
      chainId: transaction.publicMeta.chainId,
      gasLimit: transaction.publicMeta.gasLimit,
      gasPrice: transaction.publicMeta.gasPrice,
      sender: transaction.publicMeta.sender,
      ttl: transaction.publicMeta.ttl,
    };

    const transactionRequest = {
      id: 1,
      jsonrpc: '2.0',
      method: 'kadena_sign_v1',
      params: signingRequest,
    };

    const response = await client
      .request<ISigningResponse>({
        topic: session.topic,
        chainId: walletConnectChainId,
        request: transactionRequest,
      })
      .catch((e) => console.log('Error signing transaction:', e));

    console.log('Response from client.request:', response);

    if (!response?.body) {
      throw new Error('Error signing transaction');
    }

    const { cmd, sigs } = response.body;

    transaction.addSignatures(
      ...sigs.map((sig, i) => ({
        ...transaction.signers[i],
        sig: sig.sig,
      })),
    );

    transaction.cmd = cmd;

    return transaction;
  };

  return signWithWalletConnect;
}
