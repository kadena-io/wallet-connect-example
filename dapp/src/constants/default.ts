if (!process.env.NEXT_PUBLIC_PROJECT_ID)
  throw new Error("`NEXT_PUBLIC_PROJECT_ID` env variable is missing.");

export const DEFAULT_TEST_CHAINS = ["kadena:testnet04"];

export const DEFAULT_MAIN_CHAINS = ["kadena:mainnet01"];

export const DEFAULT_CHAINS = [...DEFAULT_TEST_CHAINS, ...DEFAULT_MAIN_CHAINS];

export const DEFAULT_PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;
export const DEFAULT_RELAY_URL = process.env.NEXT_PUBLIC_RELAY_URL;

export const DEFAULT_LOGGER = "debug";

export const DEFAULT_APP_METADATA = {
  name: "Kadena App",
  description: "Kadena App for WalletConnect",
  url: "https://www.kadena.io/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

type RelayerType = {
  value: string | undefined;
  label: string;
};

export enum DEFAULT_KADENA_METHODS {
  KADENA_SIGN_TRANSACTION = "kadena_signTransaction",
  KADENA_SIGN_MESSAGE = "kadena_signMessage",
}

export enum DEFAULT_KADENA_EVENTS {}

export const REGIONALIZED_RELAYER_ENDPOINTS: RelayerType[] = [
  {
    value: DEFAULT_RELAY_URL,
    label: "Default",
  },

  {
    value: "wss://us-east-1.relay.walletconnect.com/",
    label: "US",
  },
  {
    value: "wss://eu-central-1.relay.walletconnect.com/",
    label: "EU",
  },
  {
    value: "wss://ap-southeast-1.relay.walletconnect.com/",
    label: "Asia Pacific",
  },
];
