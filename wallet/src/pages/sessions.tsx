import PageHeader from '@/components/PageHeader'
import SessionCard from '@/components/SessionCard'
import { signClient } from '@/utils/WalletConnectUtil'

export default function SessionsPage() {
  return (
    <>
      <PageHeader title="Sessions" />
      {signClient.session.values.map(session => {
        const { name, icons, url } = session.peer.metadata

        return (
          <SessionCard
            key={session.topic}
            topic={session.topic}
            name={name}
            logo={icons[0]}
            url={url}
          />
        )
      })}
    </>
  )
}
