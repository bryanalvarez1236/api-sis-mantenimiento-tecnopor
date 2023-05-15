import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { ServiceError } from '.'
import prisma from '../libs/db'
import { CreateEngineDto, UpdateEngineDto } from '../schemas/engine'
import { getMachineByCode, machineNotFoundMessage } from './machine.service'

export function engineNotFoundMessage(engineCode: string) {
  return `El motor con el código '${engineCode}' no existe`
}
export function engineAlreadyExistsMessage(engineCode: string) {
  return `El motor con el código '${engineCode}' ya existe`
}

interface GetMachineEnginesProps {
  machineCode: string
}
export async function getMachineEngines({
  machineCode,
}: GetMachineEnginesProps) {
  const { engines } = await getMachineByCode({ code: machineCode })
  return engines
}

interface GetEngineByCodeProps {
  code: string
}
export async function getEngineByCode({ code }: GetEngineByCodeProps) {
  const foundEngine = await prisma.engine.findUnique({
    where: { code },
  })
  if (foundEngine == null) {
    throw new ServiceError({
      status: 404,
      message: engineNotFoundMessage(code),
    })
  }
  return foundEngine
}

interface AddEngineProps {
  machineCode: string
  createDto: CreateEngineDto
}
export async function addEngine({ machineCode, createDto }: AddEngineProps) {
  try {
    return await prisma.engine.create({ data: { ...createDto, machineCode } })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ServiceError({
          status: 409,
          message: engineAlreadyExistsMessage(createDto.code),
        })
      }
      if (error.code === 'P2003') {
        throw new ServiceError({
          status: 404,
          message: machineNotFoundMessage(machineCode),
        })
      }
    }
    throw new ServiceError({ status: 500 })
  }
}

interface UpdateEngineByCodeProps {
  code: string
  updateDto: UpdateEngineDto
}
export async function updateEngineByCode({
  code,
  updateDto,
}: UpdateEngineByCodeProps) {
  try {
    return await prisma.engine.update({ where: { code }, data: updateDto })
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new ServiceError({
        status: 404,
        message: engineNotFoundMessage(code),
      })
    }
    throw new ServiceError({ status: 500 })
  }
}
