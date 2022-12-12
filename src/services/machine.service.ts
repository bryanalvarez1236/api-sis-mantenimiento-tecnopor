import { ServiceError } from '.'
import prisma from '../libs/db'

export async function getMachineByCode(machineCode: string) {
  const foundMachine = await prisma.machine.findUnique({
    where: { code: machineCode },
  })
  if (!foundMachine) {
    throw new ServiceError(
      `La máquina con el código '${machineCode}' no existe`,
      404
    )
  }
  return foundMachine
}
