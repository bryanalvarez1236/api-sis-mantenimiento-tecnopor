import { Engine, Machine, Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import {
  CheckSelect,
  CreateArgsType,
  FindUniqueArgs,
  FindUniqueType,
  getCreateArgsConfig,
  getFindManyArgsConfig,
  getFindUniqueArgsConfig,
  getUpdateArgsConfig,
  PRISMA_NOT_FOUND_ERROR_CODE,
  PRISMA_UNIQUE_ERROR_CODE,
  ReturnCheck,
  ServiceError,
  ThrowError,
  UpdateArgsType,
} from '.'
import prisma from '../libs/db'
import { CreateEngineDto, UpdateEngineDto } from '../schemas/engine'
import * as machineService from './machine.service'

type EngineCreateArgs = Prisma.EngineCreateArgs
type EngineFindUniqueArgs = Prisma.EngineFindUniqueArgs
type EngineFindManyArgs = Prisma.EngineFindManyArgs
type EngineUpdateArgs = Prisma.EngineUpdateArgs

type EngineClient<T> = Prisma.Prisma__EngineClient<T>
type EngineGetPayload<T extends FindUniqueType<EngineFindUniqueArgs>> =
  Prisma.EngineGetPayload<T>

function engineNotFound(engineCode: string): ThrowError {
  return {
    status: 404,
    message: `El motor con el código '${engineCode}' no existe`,
  }
}

export async function getMachineEngines<
  T extends EngineFindManyArgs,
  S extends Machine & { image: { url: string } } & { engines: Array<Engine> },
  P extends EngineGetPayload<T>,
  U extends Machine & { image: { url: string } } & { engines: Array<P> }
>(machineCode: string, config?: T): ReturnCheck<T, S, U> {
  const defaultEngineConfig = getFindManyArgsConfig<EngineFindManyArgs>(
    { orderBy: { code: 'asc' } },
    config
  )
  const foundMachine = await machineService.getMachineByCode(machineCode, {
    include: { engines: defaultEngineConfig, image: { select: { url: true } } },
  })
  return foundMachine as never as CheckSelect<T, S, U>
}

export async function getEngineByCode<
  T extends FindUniqueType<EngineFindUniqueArgs>,
  S extends EngineClient<Engine>,
  P extends EngineGetPayload<T>,
  U extends EngineClient<P>
>(
  engineCode: string,
  config?: FindUniqueArgs<T, EngineFindUniqueArgs>
): ReturnCheck<T, S, U> {
  const defaultConfig = getFindUniqueArgsConfig(
    { where: { code: engineCode } },
    config
  )
  const foundEngine = await prisma.engine.findUnique(defaultConfig)
  if (!foundEngine) {
    throw new ServiceError(engineNotFound(engineCode))
  }
  return foundEngine as never as CheckSelect<T, S, U>
}

export async function createEngine<
  T extends CreateArgsType<EngineCreateArgs>,
  S extends EngineClient<Engine>,
  P extends EngineGetPayload<T>,
  U extends EngineClient<P>
>(
  createEngineDto: CreateEngineDto,
  machineCode: string,
  config?: T
): ReturnCheck<T, S, U> {
  await machineService.getMachineByCode(machineCode)
  const defaultConfig = getCreateArgsConfig<EngineCreateArgs>(
    { data: { ...createEngineDto, machineCode } },
    config
  )
  try {
    const createdEngine = await prisma.engine.create(defaultConfig)
    return createdEngine as never as CheckSelect<T, S, U>
  } catch (error) {
    const { code } = error as PrismaClientKnownRequestError
    const throwError: ThrowError = {
      status: 500,
    }
    if (code === PRISMA_UNIQUE_ERROR_CODE) {
      throwError.status = 409
      throwError.message = `El motor con el código '${createEngineDto.code}' ya existe`
    }
    throw throwError
  }
}

export async function updateEngineByCode<
  T extends UpdateArgsType<EngineUpdateArgs>,
  S extends EngineClient<Engine>,
  P extends EngineGetPayload<T>,
  U extends EngineClient<P>
>(
  engineCode: string,
  updateEngineDto: UpdateEngineDto,
  config?: T
): ReturnCheck<T, S, U> {
  const defaultConfig = getUpdateArgsConfig<EngineUpdateArgs>(
    { data: updateEngineDto, where: { code: engineCode } },
    config
  )
  try {
    const updatedEngine = await prisma.engine.update(defaultConfig)
    return updatedEngine as never as CheckSelect<T, S, U>
  } catch (error) {
    let throwError: ThrowError = {
      status: 500,
    }
    const { code } = error as PrismaClientKnownRequestError
    if (code === PRISMA_NOT_FOUND_ERROR_CODE) {
      throwError = engineNotFound(engineCode)
    }
    throw new ServiceError(throwError)
  }
}
