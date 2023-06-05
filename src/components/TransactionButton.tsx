import { useWalletConnectClient } from '@/providers/ClientContextProvider';
import { signWithWalletConnect } from '@/utils/signWithWalletConnect';
import { IAccount, ISigningRequest } from '@/types';
import { useState } from 'react';
import { IPactCommand, PactCommand } from '@kadena/client';
import { onlyKey } from '@/utils/onlyKey';
import { apiHost } from '@/utils/apiHost';
import { local } from '@kadena/chainweb-node-client';
import { ICommand } from '@kadena/types';
import { PactNumber } from '@kadena/pactjs';

export const TransactionButton = ({
  selectedAccount,
}: {
  selectedAccount?: IAccount;
}) => {
  const { client, session } = useWalletConnectClient();

  const [amount, setAmount] = useState<number>(0);
  const [toAccount, setToAccount] = useState<string | undefined>();

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

    const decimalFormatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 12,
    });

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

    const signedPactCommand = await signWithWalletConnect(
      client,
      session,
      pactCommand,
    );

    console.log({ signedPactCommand });
    return {
      signedPactCommand,
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

    console.log('signWithWalletConnect localResult:', localResult);
  };

  return (
    <>
      <h2>Transaction</h2>
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

          {/* <button onClick={handleClickSend}>Validate transaction</button> */}
        </>
      ) : (
        <div>Select an account to send the transfer from</div>
      )}
    </>
  );
};
