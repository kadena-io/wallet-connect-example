import { createContext, ReactNode, useContext, useState } from "react";
import * as encoding from "@walletconnect/encoding";
import { useWalletConnectClient } from "./ClientContext";
import { DEFAULT_KADENA_METHODS } from "../constants";
import { useChainData } from "./ChainDataContext";

/**
 * Types
 */
interface IFormattedRpcResponse {
  method?: string;
  address?: string;
  valid: boolean;
  result: string;
}

type TRpcRequestCallback = (
  chainId: string,
  address: string,
  message?: string
) => Promise<void>;

interface IContext {
  ping: () => Promise<void>;
  kadenaRpc: {
    testSignTransaction: TRpcRequestCallback;
    testSignMessage: TRpcRequestCallback;
  };
  rpcResult?: IFormattedRpcResponse | null;
  isRpcRequestPending: boolean;
}

/**
 * Context
 */
export const JsonRpcContext = createContext<IContext>({} as IContext);

/**
 * Provider
 */
export function JsonRpcContextProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<IFormattedRpcResponse | null>();

  const { client, session, accounts, balances } = useWalletConnectClient();

  const { chainData } = useChainData();

  const _createJsonRpcRequestHandler =
    (
      rpcRequest: (
        chainId: string,
        address: string
      ) => Promise<IFormattedRpcResponse>
    ) =>
    async (chainId: string, address: string) => {
      if (typeof client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }
      if (typeof session === "undefined") {
        throw new Error("Session is not connected");
      }

      try {
        setPending(true);
        const result = await rpcRequest(chainId, address);
        setResult(result);
      } catch (err: any) {
        console.error("RPC request failed: ", err);
        setResult({
          address,
          valid: false,
          result: err?.message ?? err,
        });
      } finally {
        setPending(false);
      }
    };

  const ping = async () => {
    if (typeof client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof session === "undefined") {
      throw new Error("Session is not connected");
    }

    try {
      setPending(true);

      let valid = false;

      try {
        await client.ping({ topic: session.topic });
        valid = true;
      } catch (e) {
        valid = false;
      }

      // display result
      setResult({
        method: "ping",
        valid,
        result: valid ? "Ping succeeded" : "Ping failed",
      });
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setPending(false);
    }
  };

  // -------- KADENA RPC METHODS --------

  const kadenaRpc = {
    testSignTransaction: _createJsonRpcRequestHandler(
      async (
        WCNetworkId: string,
        publicKey: string
      ): Promise<IFormattedRpcResponse> => {
        const method = DEFAULT_KADENA_METHODS.KADENA_SIGN_TRANSACTION;
        const [_, networkId] = WCNetworkId.split(":");

        const transaction = {
          code: `(coin.transfer "k:${publicKey}" "k:c0f35670c3ae8c0f4927e5d456dfd237195fc05d752fdb59379fd2d04f259b44" 2.0)`,
          data: {},
          caps: [] as any,
          type: "exec",
          publicMeta: {
            chainId: "1",
            sender: "",
            gasLimit: 1000,
            gasPrice: 0.000001,
            ttl: 28800,
          },
          signers: [{ pubKey: publicKey, caps: [] }],
          networkId,
        };

        transaction.signers.forEach((signer) => {
          signer.caps.forEach((cap: any) => {
            transaction.caps.push({
              role: cap.name,
              description: `CAP for ${cap.name}`,
              cap: {
                name: cap.name,
                args: cap.args,
              },
            });
          });
        });

        const result = await client!.request<{ signature: string }>({
          topic: session!.topic,
          chainId: WCNetworkId,
          request: {
            method,
            params: { transaction },
          },
        });

        return {
          method,
          address: publicKey,
          valid: true,
          result: result.signature,
        };
      }
    ),
    testSignMessage: _createJsonRpcRequestHandler(
      async (
        chainId: string,
        address: string
      ): Promise<IFormattedRpcResponse> => {
        const method = DEFAULT_KADENA_METHODS.KADENA_SIGN_MESSAGE;

        const message = `This is a Kadena message - ${Date.now()}`;

        // encode message (hex)
        const hexMsg = encoding.utf8ToHex(message, true);

        const result = await client!.request<{ signature: string }>({
          topic: session!.topic,
          chainId,
          request: {
            method,
            params: {
              address,
              message: hexMsg,
            },
          },
        });

        return {
          method,
          address,
          valid: true,
          result: result.signature,
        };
      }
    ),
  };

  return (
    <JsonRpcContext.Provider
      value={{
        ping,
        kadenaRpc,
        rpcResult: result,
        isRpcRequestPending: pending,
      }}
    >
      {children}
    </JsonRpcContext.Provider>
  );
}

export function useJsonRpc() {
  const context = useContext(JsonRpcContext);
  if (context === undefined) {
    throw new Error("useJsonRpc must be used within a JsonRpcContextProvider");
  }
  return context;
}
