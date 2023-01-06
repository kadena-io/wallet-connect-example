import SettingsStore from '@/store/SettingsStore'
import { createOrRestoreKadenaWallet } from '@/utils/KadenaWalletUtil'
import { createSignClient } from '@/utils/WalletConnectUtil'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false)
  const prevRelayerURLValue = useRef<string>('')

  const { relayerRegionURL } = useSnapshot(SettingsStore.state)

  const onInitialize = useCallback(async () => {
    try {
      const { kadenaAddresses } = await createOrRestoreKadenaWallet()

      SettingsStore.setKadenaAddress(kadenaAddresses[0])
      await createSignClient(relayerRegionURL)
      prevRelayerURLValue.current = relayerRegionURL

      setInitialized(true)
    } catch (err: unknown) {
      alert(err)
    }
  }, [relayerRegionURL])

  useEffect(() => {
    if (!initialized) {
      onInitialize()
    }
    if (prevRelayerURLValue.current !== relayerRegionURL) {
      setInitialized(false)
      onInitialize()
    }
  }, [initialized, onInitialize, relayerRegionURL])

  return initialized
}
