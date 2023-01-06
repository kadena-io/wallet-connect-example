import { Container, Modal, Text } from '@nextui-org/react'
import { ReactNode } from 'react'

/**
 * Types
 */
interface IProps {
  title: string
  children: ReactNode | ReactNode[]
}

/**
 * Component
 */
export default function RequestModalContainer({ children, title }: IProps) {
  return (
    <>
      <Modal.Header>
        <Text h3>{title}</Text>
      </Modal.Header>

      <Modal.Body>
        <Container css={{ padding: 0 }}>{children}</Container>
      </Modal.Body>
    </>
  )
}
