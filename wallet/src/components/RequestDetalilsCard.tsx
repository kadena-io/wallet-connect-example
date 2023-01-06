import { KADENA_CHAINS, TKadenaChain } from '@/data/KadenaData'

import { Col, Divider, Row, Text } from '@nextui-org/react'

/**
 * Types
 */
interface IProps {
  chains: string[]
  protocol: string
}

/**
 * Component
 */
export default function RequestDetailsCard({ chains, protocol }: IProps) {
  return (
    <>
      <Row>
        <Col>
          <Text h5>Blockchain(s)</Text>
          <Text color="$gray400">
            {chains.map(chain => KADENA_CHAINS[chain as TKadenaChain]?.name ?? chain).join(', ')}
          </Text>
        </Col>
      </Row>

      <Divider y={2} />

      <Row>
        <Col>
          <Text h5>Relay Protocol</Text>
          <Text color="$gray400">{protocol}</Text>
        </Col>
      </Row>
    </>
  )
}
