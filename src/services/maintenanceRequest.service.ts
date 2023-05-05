import { ServiceError } from '.'
import prisma from '../libs/db'
import { CreateMaintenanceRequestDto } from '../schemas/maintenanceRequest'

interface CreateMaintenanceRequestProps {
  machineCode: string
  createDto: CreateMaintenanceRequestDto
}
export async function createMaintenanceRequest({
  machineCode,
  createDto,
}: CreateMaintenanceRequestProps) {
  const machine = await prisma.machine.findUnique({
    where: { code: machineCode },
    select: { name: true },
  })
  if (machine == null) {
    throw new ServiceError({
      status: 404,
      message: `La máquina con el código '${machineCode}' no existe`,
    })
  }

  try {
    const created = await prisma.maintenanceRequest.create({
      data: { ...createDto, machineCode },
      select: { id: true, description: true, createdAt: true },
    })
    return { ...created, machine }
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}
