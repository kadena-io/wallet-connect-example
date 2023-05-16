import { GetAccounts } from "@/components/GetAccounts";
import { TransactionButton } from "@/components/TransactionButton";
import { useWalletConnectClient } from "@/providers/ClientContextProvider";
import { networkMap } from "@/utils/networkMap";
import { useEffect, useState } from "react";

function App() {
  const { pairings, session, accounts, connect, disconnect, isInitializing } =
    useWalletConnectClient();

  const [selectedNetwork, setSelectedNetwork] =
    useState<keyof typeof networkMap>("mainnet01");

  const [selectedAccount, setSelectedAccount] = useState<{
    account: string;
    chain: string;
  }>();

  const handleConnect = () => {
    connect();
  };

  return (
    <div>
      <h1>WalletConnect</h1>
      <p>
        <select
          onChange={(e) =>
            setSelectedNetwork(e.target.value as keyof typeof networkMap)
          }
        >
          {Object.keys(networkMap).map((network) => (
            <option key={network} value={network}>
              {network}
            </option>
          ))}
        </select>
      </p>
      {session ? (
        <>
          <button onClick={disconnect}>Disconnect</button>

          <GetAccounts
            walletConnectAccounts={accounts}
            selectedNetwork={selectedNetwork}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
          />
          <TransactionButton
            selectedNetwork={selectedNetwork}
            selectedAccount={selectedAccount}
            accounts={accounts}
          />
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
