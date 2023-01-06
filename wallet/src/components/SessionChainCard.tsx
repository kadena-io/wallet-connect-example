import ChainCard from '@/components/ChainCard'
import { KADENA_MAINNET_CHAINS, KADENA_TEST_CHAINS } from '@/data/KadenaData'
import { formatChainName } from '@/utils/HelperUtil'
import { Col, Row, Text } from '@nextui-org/react'
import { SessionTypes } from '@walletconnect/types'

/**
 * Utilities
 */
const CHAIN_METADATA = {
  ...KADENA_MAINNET_CHAINS,
  ...KADENA_TEST_CHAINS
}

/**
 * Types
 */
interface IProps {
  namespace: SessionTypes.Namespace
}

/**
 * Component
 */
export default function SessionChainCard({ namespace }: IProps) {
  const chains: string[] = []

  namespace.accounts.forEach(account => {
    const [type, chain] = account.split(':')
    const chainId = `${type}:${chain}`
    chains.push(chainId)
  })

  return (
    <>
      {chains.map(chainId => {
        const extensionMethods: SessionTypes.Namespace['methods'] = []
        const extensionEvents: SessionTypes.Namespace['events'] = []

        namespace.extension?.map(({ accounts, methods, events }) => {
          accounts.forEach(account => {
            const [type, chain] = account.split(':')
            const chainId = `${type}:${chain}`
            if (chains.includes(chainId)) {
              extensionMethods.push(...methods)
              extensionEvents.push(...events)
            }
          })
        })

        const allMethods = [...namespace.methods, ...extensionMethods]
        const allEvents = [...namespace.events, ...extensionEvents]
        // @ts-expect-error
        const rgb = CHAIN_METADATA[chainId]?.rgb

        return (
          <ChainCard key={chainId} rgb={rgb ?? ''} flexDirection="col" alignItems="flex-start">
            <Text h5 css={{ marginBottom: '$5' }}>
              {formatChainName(chainId)}
            </Text>
            <Row>
              <Col>
                <Text h6>Methods</Text>
                <Text color="$gray300">{allMethods.length ? allMethods.join(', ') : '-'}</Text>
              </Col>
            </Row>
            <Row css={{ marginTop: '$5' }}>
              <Col>
                <Text h6>Events</Text>
                <Text color="$gray300">{allEvents.length ? allEvents.join(', ') : '-'}</Text>
              </Col>
            </Row>
          </ChainCard>
        )
      })}
    </>
  )
}
