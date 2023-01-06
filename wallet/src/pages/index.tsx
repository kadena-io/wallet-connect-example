import AccountCard from '@/components/AccountCard'
import PageHeader from '@/components/PageHeader'
import { KADENA_MAINNET_CHAINS, KADENA_TEST_CHAINS } from '@/data/KadenaData'
import SettingsStore from '@/store/SettingsStore'
import { useSnapshot } from 'valtio'

export default function HomePage() {
  const { kadenaAddress } = useSnapshot(SettingsStore.state)

  return (
    <>
      <PageHeader title="Accounts" />

      {Object.values({ ...KADENA_MAINNET_CHAINS, ...KADENA_TEST_CHAINS }).map(
        ({ name, logo, rgb }) => (
          <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={kadenaAddress} />
        )
      )}
    </>
  )
}
