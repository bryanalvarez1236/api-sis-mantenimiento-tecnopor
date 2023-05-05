import { PrismaClientValidationError } from '@prisma/client/runtime'
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

export async function getMaintenanceRequest() {
  try {
    return await prisma.maintenanceRequest.findMany({
      where: { verified: false },
      select: {
        id: true,
        description: true,
        createdAt: true,
        machine: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}

export async function verifyMaintenanceRequest(id: number) {
  try {
    const foundMaintenaceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id },
    })
    if (foundMaintenaceRequest == null) {
      throw new ServiceError({
        status: 404,
        message: `La solicitud de mantenimiento con el id '${id}' no existe`,
      })
    }
    const updated = await prisma.maintenanceRequest.update({
      data: { verified: true },
      where: { id },
      select: { id: true },
    })
    return updated
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error
    }
    if (error instanceof PrismaClientValidationError) {
      throw new ServiceError({
        status: 400,
        message: 'El id de la solicitud de mantenimiento debe ser un número',
      })
    }
    throw new ServiceError({ status: 500 })
  }
}
