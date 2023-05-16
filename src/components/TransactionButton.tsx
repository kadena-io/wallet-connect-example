import { useWalletConnectClient } from "@/providers/ClientContextProvider";
import { networkMap } from "@/utils/networkMap";
import { onlyKey } from "@/utils/onlyKey";
import { signWithWalletConnect } from "@/utils/signWithWalletConnect";
import { PactCommand } from "@kadena/client";
import { useState } from "react";

export const TransactionButton = ({
  selectedNetwork,
  selectedAccount,
}: {
  selectedNetwork: keyof typeof networkMap;
  selectedAccount: any;
  accounts?: any[];
}) => {
  const { client, session } = useWalletConnectClient();

  const [amount, setAmount] = useState<number>(0);
  const [toAccount, setToAccount] = useState<string | undefined>();

  const handleClick = async () => {
    if (!client) {
      throw new Error("No client");
    }

    if (!session) {
      throw new Error("No session");
    }

    if (!selectedAccount) {
      throw new Error("No selected account to send from");
    }

    if (!toAccount) {
      throw new Error("No account to send to set");
    }

    if (!amount) {
      throw new Error("No amount set");
    }

    const pactCommand = new PactCommand();

    pactCommand.code = `(coin.transfer "${selectedAccount.account}" "${toAccount}" ${amount})`;

    pactCommand
      .addCap("coin.GAS", onlyKey(selectedAccount.account))
      .addCap("coin.TRANSFER", onlyKey(selectedAccount.account), [
        selectedAccount.account,
        toAccount,
        amount,
      ])
      .setMeta(
        {
          sender: selectedAccount.account,
          chainId: selectedAccount.chain,
        },
        selectedNetwork
      );

    const result = await signWithWalletConnect(client, session, pactCommand);

    console.log("signWithWalletConnect result:", result);
  };

  return (
    <>
      <h2>Transaction</h2>
      {selectedAccount ? (
        <>
          <p>
            <strong>Account:</strong> {selectedAccount?.account}
            <br />
            <strong>Chain:</strong> {selectedAccount?.chain}
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
              <strong>Amount:</strong>{" "}
              <input
                type="number"
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </label>
          </p>

          <button onClick={handleClick}>Send transaction</button>
        </>
      ) : (
        <div>Select an account to send the transfer from</div>
      )}
    </>
  );
};
