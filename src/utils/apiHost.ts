import { networkMap } from "./networkMap";

/**
 * Composes the apiHost
 *
 * @param [chainId='1']
 * @param [network='testnet']
 * @param [apiVersion='0.0']
 * @return
 */
export function apiHost(
  chainId: string = "1",
  network: keyof typeof networkMap = "testnet04",
  apiVersion: string = "0.0"
): string {
  return `https://${networkMap[network].api}/chainweb/${apiVersion}/${network}/chain/${chainId}/pact`;
}
