import { JsonRpcRequest } from "@walletconnect/jsonrpc-utils";

import * as kadena from "./kadena";

import {
  ChainMetadata,
  ChainRequestRender,
  NamespaceMetadata,
} from "../helpers";

export const KadenaMetadata: NamespaceMetadata = {
  mainnet01: {
    logo: "/assets/kadena.png",
    rgb: "237, 9, 143",
  },
  testnet04: {
    logo: "/assets/kadena.png",
    rgb: "237, 9, 143",
  },
};

export function getChainMetadata(chainId: string): ChainMetadata {
  const namespace = chainId.split(":")[0];
  const reference = chainId.split(":")[1];
  const metadata = KadenaMetadata[reference];

  switch (namespace) {
    case "kadena":
      return kadena.getChainMetadata(chainId);

    default:
      throw new Error(`No metadata handler for namespace ${namespace}`);
  }
}

export function getChainRequestRender(
  request: JsonRpcRequest,
  chainId: string
): ChainRequestRender[] {
  const namespace = chainId.split(":")[0];
  switch (namespace) {
    case "kadena":
      return kadena.getChainRequestRender(request);
    default:
      throw new Error(`No render handler for namespace ${namespace}`);
  }
}
