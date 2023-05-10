import { ClientContextProvider } from "@/providers/ClientContextProvider";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ClientContextProvider>
        <Component {...pageProps} />
      </ClientContextProvider>
    </>
  );
}
