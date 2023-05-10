import { GetAccounts } from "@/components/GetAccounts";
import { TransactionButton } from "@/components/TransactionButton";
import { useWalletConnectClient } from "@/providers/ClientContextProvider";
import { useEffect, useState } from "react";

function App() {
  const { pairings, session, accounts, connect, disconnect, isInitializing } =
    useWalletConnectClient();

  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();

  useEffect(() => {
    if (!accounts) return;

    setSelectedAccount(accounts[0]);
  }, [accounts]);

  const handleConnect = () => {
    connect();
  };

  return (
    <div>
      <h1>WalletConnect</h1>
      {session ? (
        <>
          <button onClick={disconnect}>Disconnect</button>

          <select onChange={(e) => setSelectedAccount(e.target.value)}>
            {accounts?.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>

          <GetAccounts selectedAccount={selectedAccount} />
          <TransactionButton selectedAccount={selectedAccount} />
        </>
      ) : (
        <button onClick={handleConnect} disabled={isInitializing}>
          {isInitializing ? "Initializing..." : "Connect"}
        </button>
      )}
    </div>
  );
}

export default App;
