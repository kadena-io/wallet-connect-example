import { GetAccounts } from '@/components/GetAccounts';
import { TransactionButton } from '@/components/TransactionButton';
import { useWalletConnectClient } from '@/providers/ClientContextProvider';
import { IAccount } from '@/types';
import { networkMap } from '@/utils/networkMap';
import { NetworkId } from '@kadena/types';
import { useState } from 'react';

function App() {
  const { session, connect, disconnect, isInitializing } =
    useWalletConnectClient();

  const [selectedNetwork, setSelectedNetwork] =
    useState<NetworkId>('mainnet01');

  const [selectedAccount, setSelectedAccount] = useState<IAccount>();

  const handleConnect = () => {
    connect();
  };

  return (
    <div>
      <h1>WalletConnect</h1>
      {session ? (
        <>
          <button onClick={disconnect}>Disconnect</button>

          <GetAccounts
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
          />
          <TransactionButton selectedAccount={selectedAccount} />
        </>
      ) : (
        <button onClick={handleConnect} disabled={isInitializing}>
          {isInitializing ? 'Initializing...' : 'Connect'}
        </button>
      )}
    </div>
  );
}

export default App;
