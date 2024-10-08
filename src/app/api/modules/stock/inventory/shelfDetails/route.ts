import { NextResponse, type NextRequest } from 'next/server'

import { FormsCrypt } from '@/services'
import { dbInventory } from '@/utils/database/modules/estoque/inventario'

type ShelfDetailsFetchProps = {
  detalhesPrat: {
    codProd: string
    descProd: string
    qtdAtual: number
  }[]
}

type ShelfDetailsFetchB7Props = {
  detalhesItem: {
    codProd: string
    qtdProd: number
  }[]
}

interface ResSqlErrorProps {
  errorCode: number
  errorMessage: string
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const urlApi = process.env.ENDPOINT_SHELF_DETAILS
  const urlApiStatus = process.env.ENDPOINT_SEARCH_EXIST_ITEM

  const descPra = await FormsCrypt.verifyData(data)

  if (!descPra) {
    return NextResponse.json({ message: 'Dados mal informados ou inexistentes' }, { status: 400 })
  }

  try {
    const inventoryData = await dbInventory.invDocument.verifyStatus()

    if (!inventoryData) {
      throw new Error('Erro ao buscar dados do inventário')
    }

    const { armazem, documento, dt_ini: dtIni } = inventoryData

    /// ////////////////// Busca lista de itens dentro da prateleira /////////////////////
    const response = await fetch(`${urlApi}cPrat=${descPra}&cArmaz=${armazem}`, {
      method: 'GET',
      cache: 'no-cache',
      // next: { revalidate: 3600 },
    })

    const { detalhesPrat: shelfDetails }: ShelfDetailsFetchProps = await response.json()

    if (!shelfDetails) {
      return NextResponse.json({ message: 'Sem dados na prateleira' }, { status: 200 })
    }

    /// Armazena somente os códigos dos produtos
    const codProdList = shelfDetails.map((item) => item.codProd)

    /// ////////////////// Verifica se os itens estão lançados/conferidos na SB7 /////////////////////
    const responseSqlServer = await fetch(`${urlApiStatus}`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json', // Tem que definir o content type (principalemente no POST)
      },
      body: JSON.stringify({
        aCodProd: codProdList,
        cArmaz: armazem,
        cDocument: documento,
        cDate: formatDate(dtIni),
      }),
    })

    const searchProdExist: ShelfDetailsFetchB7Props | ResSqlErrorProps = await responseSqlServer.json()

    if ('errorCode' in searchProdExist) {
      const addShelfStatus = shelfDetails.map((item) => ({
        ...item,
        currentStatus: 'Conferir',
        colorStatus: 'yellow',
        textColorStatus: '#757575',
      }))

      const responseCrypt = FormsCrypt.dataCrypt({
        shelfDetails: addShelfStatus,
        searchProdExist: [],
      })

      return NextResponse.json(responseCrypt, { status: 200 })
    }

    /// Se houver itens lançados adiciona seu respectivo status
    if ('detalhesItem' in searchProdExist) {
      const updatedShelfDetails = shelfDetails.map((shelfDetail) => {
        /// Verifica quais itens estão lançados
        const matchingItem = searchProdExist.detalhesItem.find((item) => item.codProd === shelfDetail.codProd)

        if (matchingItem) {
          if (shelfDetail.qtdAtual === matchingItem.qtdProd) {
            return {
              ...shelfDetail,
              currentStatus: 'Conferido',
              colorStatus: 'green',
              textColorStatus: '#fff',
              qtdB7: matchingItem.qtdProd,
            }
          } else {
            return {
              ...shelfDetail,
              currentStatus: 'Revisar',
              colorStatus: 'red',
              textColorStatus: '#fff',
              qtdB7: matchingItem.qtdProd,
            }
          }
        } else {
          return {
            ...shelfDetail,
            currentStatus: 'Conferir',
            colorStatus: 'yellow',
            textColorStatus: '#757575',
          }
        }
      })

      const responseCrypt = FormsCrypt.dataCrypt({
        shelfDetails: updatedShelfDetails,
      })

      return NextResponse.json(responseCrypt, { status: 200 })
    }
  } catch (error) {
    console.error('Erro no shelfDetails', error)
    return NextResponse.json({ message: 'Erro interno - contate a TI' }, { status: 500 })
  }
}

const formatDate = (date: string): string => {
  const [day, month, year] = date.split('/')
  return `${year}${month}${day}`
}
