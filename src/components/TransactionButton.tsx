import { useWalletConnectClient } from "@/providers/ClientContextProvider";
import { onlyKey } from "@/utils/onlyKey";
import { PactCommand } from "@kadena/client";

export const TransactionButton = ({
  selectedAccount,
}: {
  selectedAccount?: string;
}) => {
  const { client, session } = useWalletConnectClient();

  const handleClick = async () => {
    if (!client) {
      throw new Error("No client");
    }

    if (!session) {
      throw new Error("No session");
    }

    if (!selectedAccount) {
      throw new Error("No selected account");
    }

    const signingRequest = new PactCommand();

    signingRequest.code = `(coin.transfer "${selectedAccount}" "k:a9719977e4c9960d1428160d53ad977d4cfdf3e85b70cf83f78b2176c8fa65bf" 2.0)`;

    signingRequest
      .addCap("coin.GAS", onlyKey(selectedAccount))
      .addCap("coin.TRANSFER", onlyKey(selectedAccount), [
        selectedAccount,
        "k:1c131be8d83f1d712b33ae0c7afd60bca0db80f362f5de9ba8792c6f4e7df488",
        2,
      ])
      .setMeta(
        {
          sender: selectedAccount,
          chainId: "0",
        },
        "mainnet01"
      )
      .createCommand();

    console.log(signingRequest);

    const transactionRequest = {
      id: 1,
      jsonrpc: "2.0",
      method: "kadena_sign_v1",
      params: signingRequest,
    };

    console.log(transactionRequest);

    const result = await client
      .request({
        topic: session.topic,
        chainId: "kadena:mainnet01",
        request: transactionRequest,
      })
      .catch((e) => console.log("Error sending transaction:", e));

    console.log(result);
  };

  return (
    <>
      <h2>Transaction</h2>
      <button onClick={handleClick}>Send transaction</button>
    </>
  );
};
