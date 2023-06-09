import { SessionTypes } from '@walletconnect/types';
import Client from '@walletconnect/sign-client';
import { ISigningRequest } from '@/types';
import { ICommand } from '@kadena/types';
import { PactCommand } from '@kadena/client';

interface ISigningResponse {
  body: ICommand;
}
interface ISignFunction {
  (...transactions: PactCommand[]): Promise<ICommand[]>;
}

export function createWalletConnectSign(
  client: Client,
  session: SessionTypes.Struct,
) {
  const signWithWalletConnect: ISignFunction = (...transactions) => {
    return Promise.all(
      transactions.map(async (pactCommand) => {
        const signingRequest: ISigningRequest = {
          code: pactCommand.code,
          data: pactCommand.data,
          caps: pactCommand.signers.flatMap((signer) =>
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
          nonce: pactCommand.nonce,
          chainId: pactCommand.publicMeta.chainId,
          gasLimit: pactCommand.publicMeta.gasLimit,
          gasPrice: pactCommand.publicMeta.gasPrice,
          sender: pactCommand.publicMeta.sender,
          ttl: pactCommand.publicMeta.ttl,
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
            chainId: `kadena:${pactCommand.networkId}`,
            request: transactionRequest,
          })
          .catch((e) => console.log('Error signing transaction:', e));

        console.log('Response from client.request:', response);

        if (!response?.body) {
          throw new Error('Error signing transaction');
        }

        return response.body;
      }),
    );
  };

  return signWithWalletConnect;
}
