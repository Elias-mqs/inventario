'use client'

import { ScreenCard } from '@/components/ui/Inventory'
import { Flex, Grid } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { BsClipboardPlus } from 'react-icons/bs'

export default function HomeInventory() {
  const router = useRouter()

  const cardRoute = {
    StartInventory: '/modules/inventario/iniciar',
  }

  return (
    <Flex w="100%" direction="column" p={4} overflow="auto">
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={8}>
        <ScreenCard
          icon={BsClipboardPlus}
          title="Novo inventário"
          descCard="Iniciar um novo inventário"
          onClick={() => router.push(cardRoute.StartInventory)}
        />
        <ScreenCard icon={BsClipboardPlus} />
        <ScreenCard icon={BsClipboardPlus} />
        <ScreenCard icon={BsClipboardPlus} />
        <ScreenCard icon={BsClipboardPlus} />
        <ScreenCard icon={BsClipboardPlus} />
        <ScreenCard icon={BsClipboardPlus} />
      </Grid>
    </Flex>
  )
}
