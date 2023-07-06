import { useWalletConnectClient } from '@/providers/ClientContextProvider';
import {
  createWalletConnectSign,
  createWalletConnectQuicksign,
  commandBuilder,
  payload,
  Pact,
  setMeta,
  addSigner,
  setProp,
  createTransaction,
  signWithChainweaver,
} from '@kadena/client';
import { IAccount } from '@/types';
import { useState } from 'react';
import { IPactCommand } from '@kadena/client';
import { onlyKey } from '@/utils/onlyKey';
import { apiHost } from '@/utils/apiHost';
import { createSendRequest, local, send } from '@kadena/chainweb-node-client';
import { ChainId, ICommand, IUnsignedCommand } from '@kadena/types';
import { networkMap } from '@/utils/networkMap';

export const Transaction = ({
  selectedAccount,
  type,
}: {
  selectedAccount?: IAccount;
  type: string;
}) => {
  const { client, session } = useWalletConnectClient();

  const [amount, setAmount] = useState<number>(0);
  const [toAccount, setToAccount] = useState<string | undefined>();
  const [transaction, setTransaction] = useState<any>();
  const [localResult, setLocalResult] = useState<any>();
  const [sendResult, setSendResult] = useState<any>();

  const buildAndSignTransaction = async (): Promise<{
    signedPactCommand: IUnsignedCommand;
    chainId: ChainId;
    networkId: keyof typeof networkMap;
  }> => {
    if (!client) {
      throw new Error('No client');
    }

    if (!session) {
      throw new Error('No session');
    }

    if (!selectedAccount) {
      throw new Error('No selected account to send from');
    }

    if (!toAccount) {
      throw new Error('No account to send to set');
    }

    if (!amount) {
      throw new Error('No amount set');
    }

    const signWithWalletConnect = createWalletConnectSign(
      client,
      session,
      selectedAccount.walletConnectChainId,
    );
    const quicksignWithWalletConnect = createWalletConnectQuicksign(
      client,
      session,
      selectedAccount.walletConnectChainId,
    );

    const pactCommand = commandBuilder(
      payload.exec(
        (Pact.modules as any).coin.transfer(
          selectedAccount.account,
          toAccount,
          {
            decimal: `${amount}`,
          },
        ),
      ),
      addSigner(
        selectedAccount.publicKey, // pubKey of sender
        (withCapability: any) => [
          withCapability(
            'coin.TRANSFER',
            selectedAccount.account, // account of sender
            toAccount, // account of receiver
            { decimal: `${amount}` },
          ),
          withCapability('coin.GAS'),
        ],
      ),
      setMeta({
        chainId: selectedAccount.chainId,
        gasLimit: 1000,
        gasPrice: 1.0e-6,
        ttl: 10 * 60,
        sender: selectedAccount.account,
      }),
      setProp(
        'networkId',
        selectedAccount.network as IPactCommand['networkId'],
      ),
    );
    console.log({ pactCommand });

    const tx = createTransaction(pactCommand);
    console.log(tx);

    let signedPactCommands: (ICommand | IUnsignedCommand)[] = [];
    if (type === 'sign') {
      signedPactCommands = [await signWithWalletConnect(tx)];
      // signedPactCommands = await signWithChainweaver(tx);
    }

    if (type === 'quicksign') {
      signedPactCommands = await quicksignWithWalletConnect(tx);
    }

    if (signedPactCommands.length === 0) {
      throw new Error('No signed pact commands');
    }

    const signedPactCommand = signedPactCommands[0];

    // In this example we only support one command, so we get the first one
    setTransaction({
      signedPactCommand,
      chainId: pactCommand.meta!.chainId,
      networkId: pactCommand.networkId,
    });

    return {
      signedPactCommand,
      chainId: pactCommand.meta!.chainId,
      networkId: pactCommand.networkId as keyof typeof networkMap,
    };
  };

  const handleClickLocal = async () => {
    const { signedPactCommand, chainId, networkId } =
      await buildAndSignTransaction();

    const localResult = await local(
      signedPactCommand,
      apiHost(chainId, networkId),
    );

    setLocalResult(localResult);
  };

  const handleClickSend = async () => {
    const { signedPactCommand, chainId, networkId } = transaction;
    const sendResult = await send(
      createSendRequest(signedPactCommand),
      apiHost(chainId, networkId),
    );

    setSendResult(sendResult);
  };

  return (
    <>
      {selectedAccount ? (
        <>
          <p>
            <strong>Send from:</strong> {selectedAccount?.account}
            <br />
            <strong>Chain:</strong> {selectedAccount?.chainId}
          </p>

          <p>
            <label>
              <strong>Account to transfer to:</strong>
              <input
                type="text"
                onChange={(e) => setToAccount(e.target.value)}
              />
            </label>

            <br />

            <label>
              <strong>Amount:</strong>{' '}
              <input
                type="number"
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </label>
            <br />
            <button onClick={handleClickLocal}>
              Sign and validate transaction
            </button>
          </p>

          {localResult && (
            <>
              <details>
                <summary>Validation result</summary>
                <pre>{JSON.stringify(localResult, null, 2)}</pre>
              </details>
              <br />
              {localResult.result.status === 'success' ? (
                <button onClick={handleClickSend}>Send transaction</button>
              ) : (
                <strong>
                  Validating transaction failed, cannot send transaction
                </strong>
              )}
            </>
          )}

          {sendResult && (
            <details>
              <summary>Send result</summary>
              <pre>{JSON.stringify(sendResult, null, 2)}</pre>
            </details>
          )}
        </>
      ) : (
        <div>Select an account to send the transfer from</div>
      )}
    </>
  );
};
