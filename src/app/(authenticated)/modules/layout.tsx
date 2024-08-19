import { Container, Flex } from '@chakra-ui/react'

import { Footer, Header, Sidebar } from '@/components/ui'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Estoque - H2L',
  description: 'Aplicação para recursos do setor de estoque da H2L',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Container bg="gray.100" maxW="container.xl" px={4}>
      <Flex>
        <Sidebar />
        <Flex w="100%" direction="column">
          <Header />
          {/* o H do flex abaixo é 100%, eu alterei pra 80vh para compensar a saida provisória do Sidebar */}
          <Flex h={{ base: '100vh', sm: 'calc(100vh - 135px)' }} mt={4} ml={4} bg="#fff" borderRadius="1rem" p={4}>
            {children}
          </Flex>
          <Footer />
        </Flex>
      </Flex>
    </Container>
  )
}
