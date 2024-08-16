import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const findRoutine = async (modId: number) => {
  const routine = prisma.sis_rotinas.findMany({
    where: {
      mod_id: modId,
    },
  })
  return routine
}

const createRoutine = async (routineData: { name: string; modId: number }) => {
  await prisma.sis_rotinas.create({
    data: {
      nome: routineData.name,
      mod_id: routineData.modId,
    },
  })
}

export const routines = {
  findRoutine,
  createRoutine,
}
