import { pact } from "@kadena/chainweb-node-client";
import { hash } from "@kadena/cryptography-utils";
import { ChainId, ICommandPayload, ICommandResult } from "@kadena/types";

export async function getKadenaChainAmount(
  WCNetworkId: string
): Promise<number> {
  const ENDPOINT = WCNetworkId === "testnet04" ? "testnet." : "";

  try {
    const response = await fetch(`https://api.${ENDPOINT}chainweb.com/info`, {
      mode: "cors",
    });

    const json = await response.json();
    return json.nodeNumberOfChains;
  } catch (e) {
    console.error("Error fetching Kadena chain info", e);
    return 0;
  }
}

async function getKadenaBalanceForChain(
  publicKey: string,
  WCNetworkId: string,
  kadenaChainID: string
): Promise<number> {
  const ENDPOINT = WCNetworkId === "testnet04" ? "testnet." : "";
  const API_HOST = `https://api.${ENDPOINT}chainweb.com/chainweb/0.0/${WCNetworkId}/chain/${kadenaChainID}/pact`;

  const cmd: ICommandPayload = {
    networkId: WCNetworkId,
    payload: {
      exec: {
        data: {},
        code: `(coin.get-balance "k:${publicKey}")`,
      },
    },
    signers: [],
    meta: {
      creationTime: Math.round(new Date().getTime() / 1000),
      ttl: 28000,
      gasLimit: 2500,
      chainId: kadenaChainID as ChainId,
      gasPrice: 1e-8,
      sender: "",
    },
    nonce: "1",
  };

  const stringifiedCmd = JSON.stringify(cmd);

  const requestBody = {
    cmd: stringifiedCmd,
    hash: hash(stringifiedCmd),
    sigs: [],
  };

  const { result } = (await pact.local(
    requestBody,
    API_HOST
  )) as ICommandResult;

  if (result.status !== "success") return 0;

  return result.data as number;
}

const kadenaNumberOfChains: Record<string, number> = {
  mainnet01: 0,
  testnet04: 0,
};

export async function apiGetKadenaAccountBalance(
  publicKey: string,
  WCNetworkId: string
) {
  if (!kadenaNumberOfChains[WCNetworkId]) {
    kadenaNumberOfChains[WCNetworkId] = await getKadenaChainAmount(WCNetworkId);
  }
  const chainBalances = await Promise.all(
    Array.from(Array(kadenaNumberOfChains[WCNetworkId])).map(
      async (_val, chainNumber) =>
        getKadenaBalanceForChain(publicKey, WCNetworkId, chainNumber.toString())
    )
  );

  const totalBalance = chainBalances.reduce((acc, item) => acc + item, 0);

  return {
    balance: (totalBalance * 10e11).toString(),
    symbol: "KDA",
    name: "KDA",
  };
}
