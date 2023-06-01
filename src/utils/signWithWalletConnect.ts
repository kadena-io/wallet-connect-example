import { SessionTypes } from '@walletconnect/types';
import Client from '@walletconnect/sign-client';
import { ISigningRequest } from '@/types';
import { ISignatureJson } from '@kadena/types';
import { PactCommand } from '@kadena/client';

interface ISigningResponse {
  body: {
    cmd: string;
    sigs: ISignatureJson[];
  };
}

export function createWalletConnectConnection() {}

export async function signWithWalletConnect(
  client: Client,
  session: SessionTypes.Struct,
  pactCommand: PactCommand,
  pubKey: string,
): Promise<PactCommand> {
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
    nonce: '1', // @TODO: Get nonce from IPactCommand
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

  console.log({ transactionRequest });

  const response = await client
    .request<ISigningResponse>({
      topic: session.topic,
      chainId: `kadena:${pactCommand.networkId}`,
      request: transactionRequest,
    })
    .catch((e) => console.log('Error signing transaction:', e));

  console.log('Response from client.request:', response);

  const signatures = response?.body.sigs.map((sig) => {
    return {
      pubKey,
      sig: sig.sig,
    };
  });

  if (!signatures) {
    throw new Error('Error signing transaction');
  }

  pactCommand.addSignatures(...signatures);

  if (!response?.body?.cmd || !response?.body?.sigs) {
    throw new Error('Error signing transaction');
  }

  return pactCommand;
}
