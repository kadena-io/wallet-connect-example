import { SessionTypes } from "@walletconnect/types";
import Client from "@walletconnect/sign-client";
import { PactCommand } from "@kadena/client";

export async function signWithWalletConnect(
  client: Client,
  session: SessionTypes.Struct,
  pactCommand: PactCommand
) {
  const signingRequest = {
    code: pactCommand.code,
    data: pactCommand.data,
    caps: pactCommand.signers[0].caps, // @TODO: support multiple signers
    nonce: new Date(),
    chainId: pactCommand.publicMeta.chainId,
    gasLimit: pactCommand.publicMeta.gasLimit,
    ttl: pactCommand.publicMeta.ttl,
    sender: pactCommand.publicMeta.sender,
    extraSigners: [],
  };

  const transactionRequest = {
    id: 1,
    jsonrpc: "2.0",
    method: "kadena_sign_v1",
    params: signingRequest,
  };

  console.log({ transactionRequest });

  return client
    .request({
      topic: session.topic,
      chainId: "kadena:mainnet01",
      request: transactionRequest,
    })
    .catch((e) => console.log("Error sending transaction:", e));
}
