import { SessionTypes } from '@walletconnect/types';
import Client from '@walletconnect/sign-client';
import { IQuicksignResponse } from '@kadena/client';
import { ISignFunction } from './ISignFunction';

export function createWalletConnectQuicksign(
  client: Client,
  session: SessionTypes.Struct,
  walletConnectChainId: string,
) {
  const quicksignWithWalletConnect: ISignFunction = async (...transactions) => {
    if (!transactions) {
      throw new Error('No transaction(s) to sign');
    }

    const transactionHashes: string[] = [];

    const commandSigDatas = transactions.map((pactCommand) => {
      const { cmd, hash } = pactCommand.createCommand();
      transactionHashes.push(hash);

      return {
        cmd,
        sigs: pactCommand.signers.map((signer, i) => ({
          pubKey: signer.pubKey,
          sig: pactCommand.sigs[i]?.sig ?? null,
        })),
      };
    });

    const quickSignRequest = {
      commandSigDatas,
    };

    const transactionRequest = {
      id: 1,
      jsonrpc: '2.0',
      method: 'kadena_quicksign_v1',
      params: quickSignRequest,
    };

    const response = await client
      .request<IQuicksignResponse>({
        topic: session.topic,
        chainId: walletConnectChainId,
        request: transactionRequest,
      })
      .catch((e) => console.log('Error signing transaction:', e));

    if (!response) {
      throw new Error('Error signing transaction');
    }

    // Check if the signing was successful
    if ('responses' in response) {
      response.responses.map((signedCommand, i) => {
        if (signedCommand.outcome.result === 'success') {
          if (signedCommand.outcome.hash !== transactionHashes[i]) {
            throw new Error(
              'Hash of the transaction signed by the wallet does not match',
            );
          }

          const sigs = signedCommand.commandSigData.sigs.filter(
            (sig) => sig.sig !== null,
          ) as { pubKey: string; sig: string }[];

          // Add the signature(s) that we received from the wallet to the PactCommand(s)
          transactions[i].addSignatures(...sigs);
        }
      });
    } else {
      throw new Error('Error signing transaction');
    }

    return transactions;
  };

  return quicksignWithWalletConnect;
}
