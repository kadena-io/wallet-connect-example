import { useWalletConnectClient } from '@/providers/ClientContextProvider';
import { signWithWalletConnect } from '@/utils/signWithWalletConnect';
import { IAccount } from '@/types';
import { useState } from 'react';
import { IPactCommand, PactCommand } from '@kadena/client';
import { onlyKey } from '@/utils/onlyKey';
import { apiHost } from '@/utils/apiHost';
import { createSendRequest, local, send } from '@kadena/chainweb-node-client';
import { ICommand } from '@kadena/types';
import { PactNumber } from '@kadena/pactjs';
import { quickSignWithWalletConnect } from '@/utils/quickSignWithWalletConnect';

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
    signedPactCommand: ICommand;
    chainId: any;
    networkId: any;
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

    const pactDecimal = { decimal: `${amount}` };

    const pactCommand = new PactCommand();
    pactCommand.code = `(coin.transfer "${
      selectedAccount.account
    }" "${toAccount}" ${new PactNumber(amount).toDecimal()})`;

    pactCommand
      .setMeta(
        {
          chainId: selectedAccount.chainId,
          gasLimit: 1000,
          gasPrice: 1.0e-6,
          ttl: 10 * 60,
          sender: selectedAccount.account,
        },
        selectedAccount.network as IPactCommand['networkId'],
      )
      .addCap('coin.GAS', onlyKey(selectedAccount.account))
      .addCap(
        'coin.TRANSFER',
        onlyKey(selectedAccount.account), // pubKey of sender
        selectedAccount.account, // account of sender
        toAccount, // account of receiver
        pactDecimal, // amount
      )
      .createCommand();

    let signedPactCommand;
    if (type === 'sign') {
      signedPactCommand = await signWithWalletConnect(
        client,
        session,
        pactCommand,
      );
    }

    if (type === 'quicksign') {
      signedPactCommand = await quickSignWithWalletConnect(
        client,
        session,
        pactCommand,
      );
    }

    setTransaction({
      signedPactCommand,
      chainId: pactCommand.publicMeta.chainId,
      networkId: pactCommand.networkId,
    });

    return {
      signedPactCommand: signedPactCommand!,
      chainId: pactCommand.publicMeta.chainId,
      networkId: pactCommand.networkId,
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
          </p>

          <button onClick={handleClickLocal}>Validate transaction</button>

          {localResult && (
            <>
              <h3>Local result</h3>
              <pre>{JSON.stringify(localResult, null, 2)}</pre>
              <button onClick={handleClickSend}>Send transaction</button>
            </>
          )}

          {sendResult && (
            <>
              <h3>Send result</h3>
              <pre>{JSON.stringify(sendResult, null, 2)}</pre>
            </>
          )}
        </>
      ) : (
        <div>Select an account to send the transfer from</div>
      )}
    </>
  );
};
