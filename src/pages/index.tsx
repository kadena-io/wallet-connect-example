import { GetAccounts } from '@/components/GetAccounts';
import { Transaction } from '@/components/Transaction';
import { useWalletConnectClient } from '@/providers/ClientContextProvider';
import { IAccount, TSigningType } from '@/types';
import { useState } from 'react';

function App() {
  const { session, connect, disconnect, isInitializing } =
    useWalletConnectClient();

  const [selectedAccount, setSelectedAccount] = useState<IAccount>();
  const [signingType, setSigningType] = useState<TSigningType>('sign');

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
          {selectedAccount && (
            <>
              <hr />
              <h3>Create and sign transaction</h3>
              <strong>Select signing type</strong>
              <br />
              <label>
                <input
                  type="radio"
                  checked={signingType === 'sign'}
                  onChange={() => setSigningType('sign')}
                />
                kadena_sign_v1
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  checked={signingType === 'quicksign'}
                  onChange={() => setSigningType('quicksign')}
                />
                kadena_quicksign_v1
              </label>

              <Transaction
                selectedAccount={selectedAccount}
                type={signingType}
              />
            </>
          )}
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
