import { useState, useEffect } from "react";
import { SignClient } from "@walletconnect/sign-client";
import { Web3Modal } from "@web3modal/standalone";
import * as encoding from "@walletconnect/encoding";

const web3Modal = new Web3Modal({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  standaloneChains: ["kadena:testnet04"],
  walletConnectVersion: 2,
});

export const WalletConnect = () => {
  const [account, setAccount] = useState<string | undefined>();
  const [signClient, setSignClient] = useState<any>();
  const [session, setSession] = useState<any>();

  async function createClient() {
    console.log("createClient");
    const signClient = await SignClient.init({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    });

    setSignClient(signClient);

    signClient.on("session_event", (event) => {
      console.log("session_event", event);
      // Handle session events, such as "chainChanged", "accountsChanged", etc.
    });

    signClient.on("session_update", ({ topic, params }) => {
      console.log("session_update");
      const { namespaces } = params;
      const _session = signClient.session.get(topic);
      // Overwrite the `namespaces` of the existing session with the incoming one.
      const updatedSession = { ..._session, namespaces };
      // Integrate the updated session state into your dapp state.
      setSession(updatedSession);
    });

    signClient.on("session_delete", () => {
      console.log("session_delete");
      // Session was deleted -> reset the dapp state, clean up from user session, etc.
    });

    const { uri, approval } = await signClient.connect({
      requiredNamespaces: {
        kadena: {
          methods: [
            "kadena_sign_v1",
            "kadena_sign",
            "kadena_signTransaction",
            "kadena_signMessage",
            "kadena_getAccounts_v1",
          ],
          chains: ["kadena:testnet04"],
          events: [],
        },
      },
    });

    console.log(uri, approval);

    if (uri) {
      web3Modal.openModal({ uri });
      const rawSession = await approval();
      setSession(rawSession);
      setAccount(rawSession.namespaces.kadena.accounts[0].substr(20, 64));
      web3Modal.closeModal();
    }
  }

  const sendTransaction = async () => {
    const message = `This is a Kadena message - ${Date.now()}`;

    // encode message (hex)
    const hexMsg = encoding.utf8ToHex(message, true);

    const messageRequest = {
      method: "kadena_signMessage",
      params: {
        address: "kadena:testnet04:" + account,
        message: hexMsg,
      },
    };

    const getAccountsRequest = {
      method: "kadena_getAccounts_v1",
      params: {
        id: 1,
        jsonrpc: "2.0",
        method: "kadena_getAccounts_v1",
        params: {
          accounts: [
            {
              account: "kadena:testnet04:" + account,
              contracts: ["coin"], // optional, when omitted the wallet returns all known fungible accounts
            },
          ],
        },
      },
    };

    const transaction = {
      code: `(coin.transfer "k:${account}" "k:1c131be8d83f1d712b33ae0c7afd60bca0db80f362f5de9ba8792c6f4e7df488" 2.0)`,
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
      signers: [{ pubKey: account, caps: [] }],
      networkId: "testnet04",
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

    const transactionRequest = {
      method: "kadena_sign",
      params: { transaction },
    };

    try {
      console.log(session.topic);
      const result = await signClient.request({
        topic: session.topic,
        chainId: "kadena:testnet04",
        request: transactionRequest,
      });

      console.log(result);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <button onClick={createClient}>Connect</button>
      <button onClick={sendTransaction}>Send transaction</button>
    </div>
  );
};
