import { useWalletConnectClient } from "@/providers/ClientContextProvider";
import { BalanceItem, getBalance } from "@/utils/getBalance";
import { networkMap } from "@/utils/networkMap";
import { ChainId } from "@kadena/types";
import * as encoding from "@walletconnect/encoding";
import { Fragment, useState } from "react";

interface IAccount {
  account: string;
  contracts?: string[];
  kadenaAccounts: [
    {
      name: string;
      chains: ChainId[];
      contract: string;
    }
  ];
}
export const GetAccounts = ({
  selectedAccount,
}: {
  selectedAccount?: string;
}) => {
  const { client, session } = useWalletConnectClient();

  const [isLoading, setIsLoading] = useState(false);
  const [kadenaAccounts, setKadenaAccounts] = useState<IAccount[]>();
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [onlyForCoinContract, setOnlyForCoinContract] =
    useState<boolean>(false);

  const getBalances = (
    accounts: IAccount[],
    network: keyof typeof networkMap
  ) => {
    if (!accounts) return;

    const balanceRequests: BalanceItem[] = accounts?.reduce<any>(
      (acc, account) => {
        account.kadenaAccounts.forEach((kadenaAccount) => {
          kadenaAccount.chains.forEach((chain) => {
            acc.push(getBalance(kadenaAccount.name, network, chain));
          });
        });
        return acc;
      },
      []
    );

    Promise.all(balanceRequests).then((balances) => {
      setBalances(balances);
    });
  };

  const handleClick = async () => {
    if (!selectedAccount) return;

    setIsLoading(true);
    if (!client) {
      throw new Error("No client");
    }

    if (!session) {
      throw new Error("No session");
    }

    const accountsRequest = {
      id: 1,
      jsonrpc: "2.0",
      method: "kadena_getAccounts_v1",
      params: {
        accounts: [
          {
            account: selectedAccount,
            contracts: onlyForCoinContract ? ["coin"] : undefined, // optional, when omitted the wallet returns all known fungible accounts
          },
        ],
      },
    };

    console.info(`Calling kadena_getAccounts_v1 for ${selectedAccount}`);

    const [chain, network] = selectedAccount.split(":");

    const response = await client?.request<{ accounts: IAccount[] }>({
      topic: session.topic,
      chainId: `${chain}:${network}`,
      request: accountsRequest,
    });

    setKadenaAccounts(response?.accounts);
    getBalances(response?.accounts, network as keyof typeof networkMap);
    setIsLoading(false);
  };

  return (
    <div>
      <h2>Accounts</h2>
      <p>
        <input
          type="checkbox"
          checked={onlyForCoinContract}
          onChange={() => setOnlyForCoinContract(!onlyForCoinContract)}
        ></input>
        Get only for the coin contract
      </p>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Get accounts"}
      </button>
      {kadenaAccounts &&
        kadenaAccounts.map((account) => {
          return (
            <div key={account.account}>
              <h3>{account.account}</h3>
              {account.kadenaAccounts.map((kadenaAccount) => (
                <Fragment key={kadenaAccount.name}>
                  <div>
                    <strong>Account:</strong> {kadenaAccount.name}
                  </div>
                  <div>
                    <strong>Contract:</strong> {kadenaAccount.contract}
                  </div>
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>Chain</th>
                          <th>Balance</th>
                        </tr>
                      </thead>

                      <tbody>
                        {kadenaAccount.chains.map((chain) => (
                          <tr key={chain}>
                            <td>{chain}</td>
                            <td>
                              {
                                balances.find(
                                  (balanceItem) => balanceItem.chain === chain
                                )?.balance
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Fragment>
              ))}
            </div>
          );
        })}
    </div>
  );
};
