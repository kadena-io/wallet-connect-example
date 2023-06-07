import { SessionTypes } from '@walletconnect/types';
import Client from '@walletconnect/sign-client';
import { ISigningRequest } from '@/types';
import { ICommand, ISignatureJson } from '@kadena/types';
import { IQuickSignRequestBody, PactCommand } from '@kadena/client';

interface ISigningResponse {
  body: ICommand;
}

export async function quickSignWithWalletConnect(
  client: Client,
  session: SessionTypes.Struct,
  pactCommand: PactCommand,
): Promise<ICommand> {
  if (!pactCommand.cmd) {
    throw new Error('No command to sign');
  }

  const quickSignRequest: IQuickSignRequestBody = {
    cmdSigDatas: [
      {
        cmd: pactCommand.cmd,
        sigs: pactCommand.signers.map((signer, i) => {
          return {
            pubKey: signer.pubKey,
            sig: pactCommand.sigs[i]?.sig ?? null,
          };
        }),
      },
    ],
  };

  const transactionRequest = {
    id: 1,
    jsonrpc: '2.0',
    method: 'kadena_quicksign_v1',
    params: quickSignRequest,
  };

  console.log(transactionRequest);

  const response = await client
    .request<ISigningResponse>({
      topic: session.topic,
      chainId: `kadena:${pactCommand.networkId}`,
      request: transactionRequest,
    })
    .catch((e) => console.log('Error signing transaction:', e));

  console.log('Response from client.request:', response);

  // Since the nonce is overwritten by some wallets we cannot just get the signatures from the response.
  //
  // Because the nonce in the wallet is different from what we set in our dApp, the signatures
  // won't be valid, and also the hash would be different. Ideally we would compare the hash from before and after
  // signing to make sure our transactions are not tampered with.

  // Instead we return the complete response, which is ready for sending to the chain.

  // const signatures = response?.body.sigs.map((sig) => {
  //   return {
  //     pubKey,
  //     sig: sig.sig,
  //   };
  // });

  // if (!signatures) {
  //   throw new Error('Error signing transaction');
  // }

  // pactCommand.addSignatures(...signatures);

  // if (!response?.body?.cmd || !response?.body?.sigs) {
  //   throw new Error('Error signing transaction');
  // }

  if (!response?.body) {
    throw new Error('Error signing transaction');
  }

  return response.body;
}
