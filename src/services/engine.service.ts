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
  const foundMachine = await getMachineByCode({ code: machineCode })
  return foundMachine
}

interface GetAllEnginesProps {
  machineCode: string
}
export async function getAllEngines({ machineCode }: GetAllEnginesProps) {
  const engines = await prisma.engine.findMany({
    where: { machineCode },
    select: {
      code: true,
      function: true,
      mark: true,
      type: true,
      powerHp: true,
      powerKw: true,
      voltage: true,
      current: true,
      rpm: true,
      cosPhi: true,
      performance: true,
      frequency: true,
      poles: true,
      ip: true,
      boot: { select: { name: true } },
    },
    orderBy: { code: 'asc' },
  })
  return engines.map(({ boot, ...engine }) => ({ ...engine, boot: boot.name }))
}

interface GetEngineByCodeProps {
  code: string
}
export async function getEngineByCode({ code }: GetEngineByCodeProps) {
  const foundEngine = await prisma.engine.findUnique({
    where: { code },
    select: {
      code: true,
      function: true,
      mark: true,
      type: true,
      powerHp: true,
      powerKw: true,
      voltage: true,
      current: true,
      rpm: true,
      cosPhi: true,
      performance: true,
      frequency: true,
      poles: true,
      ip: true,
      bootId: true,
    },
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
    const { boot, ...engine } = await prisma.engine.create({
      data: { ...createDto, machineCode },
      select: {
        code: true,
        function: true,
        mark: true,
        type: true,
        powerHp: true,
        powerKw: true,
        voltage: true,
        current: true,
        rpm: true,
        cosPhi: true,
        performance: true,
        frequency: true,
        poles: true,
        ip: true,
        boot: { select: { name: true } },
      },
    })
    return { ...engine, boot: boot.name }
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
    const { boot, ...engine } = await prisma.engine.update({
      where: { code },
      data: updateDto,
      select: {
        code: true,
        function: true,
        mark: true,
        type: true,
        powerHp: true,
        powerKw: true,
        voltage: true,
        current: true,
        rpm: true,
        cosPhi: true,
        performance: true,
        frequency: true,
        poles: true,
        ip: true,
        boot: { select: { name: true } },
      },
    })
    return { ...engine, boot: boot.name }
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

interface GetFieldsToCreateEngineProps {
  machineCode: string
}
export async function getFieldsToCreateEngine({
  machineCode,
}: GetFieldsToCreateEngineProps) {
  const machine = await prisma.machine.findUnique({
    where: { code: machineCode },
    select: { code: true, name: true },
  })
  if (machine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(machineCode),
    })
  }
  const boots = await prisma.boot.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return { fields: { boots }, machine }
}

interface GetFieldsToUpdateEngineProps {
  code: string
}
export async function getFieldsToUpdateEngine({
  code,
}: GetFieldsToUpdateEngineProps) {
  const engine = await getEngineByCode({ code })
  const boots = await prisma.boot.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return { fields: { boots }, engine }
}
