import { useWalletConnectClient } from '@/providers/ClientContextProvider';
import {
  createWalletConnectSign,
  createWalletConnectQuicksign,
  Pact,
  createClient,
  ITransactionDescriptor,
  ICommandResult,
} from '@kadena/client';
import { IAccount } from '@/types';
import { useState } from 'react';
import { IUnsignedCommand } from '@kadena/types';

export const Transaction = ({
  selectedAccount,
  type,
}: {
  selectedAccount?: IAccount;
  type: string;
}) => {
  const { client, session } = useWalletConnectClient();

  const [amount, setAmount] = useState<number>(0);
  const [toAccount, setToAccount] = useState<string>();
  const [transaction, setTransaction] = useState<any>();
  const [signingResponse, setSigningResponse] = useState<any>();
  const [localResult, setLocalResult] = useState<ICommandResult>();
  const [submitResult, setSubmitResult] = useState<ITransactionDescriptor>();

  const buildAndSignTransaction = async (): Promise<IUnsignedCommand> => {
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

    const pactCommand = Pact.builder
      .execution(
        (Pact.modules as any).coin.transfer(
          selectedAccount.account,
          toAccount,
          {
            decimal: `${amount}`,
          },
        ),
      )
      .addSigner(
        selectedAccount.publicKey, // pubKey of sender
        (withCapability: any) => [
          withCapability(
            'coin.TRANSFER',
            selectedAccount.account, // account of sender
            toAccount, // account of receiver
            { decimal: `${amount}` }, // amount to send
          ),
          withCapability('coin.GAS'),
        ],
      )
      .setMeta({
        chainId: selectedAccount.chainId,
        senderAccount: selectedAccount.account,
      })
      .setNetworkId(selectedAccount.network);

    const transaction = pactCommand.createTransaction();

    let signedPactCommand: IUnsignedCommand | null = null;
    if (type === 'sign') {
      signedPactCommand = await signWithWalletConnect(transaction);
    }

    if (type === 'quicksign') {
      signedPactCommand = await quicksignWithWalletConnect(transaction);
    }

    if (!signedPactCommand) {
      throw new Error('No signed pact commands');
    }

    setSigningResponse(signedPactCommand);

    setTransaction(signedPactCommand);

    return signedPactCommand;
  };

  const handleClickLocal = async () => {
    const signedPactCommand = await buildAndSignTransaction();

    const { local } = createClient();
    const localResult = await local(signedPactCommand);

    setLocalResult(localResult);
  };

  const handleClickSubmit = async () => {
    const signedPactCommand = transaction;

    const { submit } = createClient();
    const sendResult = await submit(signedPactCommand);

    setSubmitResult(sendResult);
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

          {signingResponse && (
            <details>
              <summary>Signing result</summary>
              <pre>{JSON.stringify(signingResponse, null, 2)}</pre>
            </details>
          )}

          {localResult && (
            <>
              <details>
                <summary>Validation result</summary>
                <pre>{JSON.stringify(localResult, null, 2)}</pre>
              </details>
              <br />
              {localResult.result.status === 'success' ? (
                <button onClick={handleClickSubmit}>Submit transaction</button>
              ) : (
                <strong>
                  Validating transaction failed, cannot submit transaction
                </strong>
              )}
            </>
          )}

          {submitResult && (
            <details>
              <summary>Submit result</summary>
              <pre>{JSON.stringify(submitResult, null, 2)}</pre>
            </details>
          )}
        </>
      ) : (
        <div>Select an account to send the transfer from</div>
      )}
    </>
  );
};
