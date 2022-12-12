import { Engine } from '@prisma/client'
import { ServiceError } from '.'
import prisma from '../libs/db'

export async function getEngineByCode(engineCode: string) {
  const foundEngine = await prisma.engine.findUnique({
    where: { code: engineCode },
  })
  if (!foundEngine) {
    throw new ServiceError(
      `El motor con el código '${engineCode}' no existe`,
      404
    )
  }
  return foundEngine
}

export function validateMachineCode(engine: Engine, machineCode: string) {
  if (engine.machineCode !== machineCode) {
    throw new ServiceError(
      `El motor no está disponible en la máquina con el código '${machineCode}'`,
      406
    )
  }
}
