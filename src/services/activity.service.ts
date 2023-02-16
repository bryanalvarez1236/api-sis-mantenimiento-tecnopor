import { Activity, Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import {
  CheckSelect,
  CreateArgsType,
  DeleteArgsType,
  FindUniqueArgs,
  FindUniqueType,
  getCreateArgsConfig,
  getDeleteArgsConfig,
  getFindManyArgsConfig,
  getFindUniqueArgsConfig,
  getUpdateArgsConfig,
  PRISMA_UNIQUE_ERROR_CODE,
  ReturnCheck,
  ServiceError,
  ThrowError,
  UpdateArgsType,
} from '.'
import prisma from '../libs/db'
import { CreateActivityDto, UpdateActivityDto } from '../schemas/activity'
import * as machineService from './machine.service'

type ActivityCreateArgs = Prisma.ActivityCreateArgs
type ActivityFindUniqueArgs = Prisma.ActivityFindUniqueArgs
type ActivityFindManyArgs = Prisma.ActivityFindManyArgs
type ActivityUpdateArgs = Prisma.ActivityUpdateArgs
type ActivityDeleteArgs = Prisma.ActivityDeleteArgs

type ActivityClient<T> = Prisma.Prisma__ActivityClient<T>
type ActivityGetPayload<T extends FindUniqueType<ActivityFindUniqueArgs>> =
  Prisma.ActivityGetPayload<T>

interface CreateActivityWithOptionalsDto
  extends Omit<CreateActivityDto, 'code' | 'frequency'> {
  code?: string
  frequency?: number
}

function activityNotFound(activityCode: string): ThrowError {
  return {
    status: 404,
    message: `La actividad con el código '${activityCode}' no existe`,
  }
}

export async function getMachineActivitiesByMachineCode<
  T extends ActivityFindManyArgs,
  S extends { machineName: string; activities: Array<Activity> },
  P extends ActivityGetPayload<T>,
  U extends { machineName: string; activities: Array<P> }
>(machineCode: string, config?: T): ReturnCheck<T, S, U> {
  const defaultActivityConfig = getFindManyArgsConfig<ActivityFindManyArgs>(
    { orderBy: { name: 'asc' }, where: { state: 'ACTIVE' } },
    config
  )
  const foundMachine = await machineService.getMachineByCode(machineCode, {
    include: {
      activities: defaultActivityConfig,
      image: false,
    },
  })
  const { activities, name } = foundMachine
  return { activities, machineName: name } as never as CheckSelect<T, S, U>
}

export async function getActivityByCode<
  T extends FindUniqueType<ActivityFindUniqueArgs>,
  S extends ActivityClient<Activity>,
  P extends ActivityGetPayload<T>,
  U extends ActivityClient<P>
>(
  activityCode: string,
  config?: FindUniqueArgs<T, ActivityFindUniqueArgs>
): ReturnCheck<T, S, U> {
  const defaultConfig = getFindUniqueArgsConfig(
    { where: { code: activityCode } },
    config
  )
  const foundActivity = await prisma.activity.findUnique({
    ...defaultConfig,
  })

  if (!foundActivity) {
    throw new ServiceError(activityNotFound(activityCode))
  }

  return foundActivity as never as CheckSelect<T, S, U>
}

export async function createActivity<
  T extends CreateArgsType<ActivityCreateArgs>,
  S extends ActivityClient<Activity>,
  P extends ActivityGetPayload<T>,
  U extends ActivityClient<P>
>(
  createActivityDto: CreateActivityWithOptionalsDto,
  config?: T
): ReturnCheck<T, S, U> {
  await machineService.getMachineByCode(createActivityDto.machineCode)
  const defaultConfig = getCreateArgsConfig<ActivityCreateArgs>(
    { data: createActivityDto },
    config
  )
  try {
    return (await prisma.activity.create({
      ...defaultConfig,
    })) as never as CheckSelect<T, S, U>
  } catch (error) {
    const { code } = error as PrismaClientKnownRequestError
    const throwError: ThrowError = {
      status: 500,
    }
    if (code === PRISMA_UNIQUE_ERROR_CODE) {
      throwError.status = 409
      throwError.message = `La actividad con el código '${createActivityDto.code}' ya existe`
    }
    throw throwError
  }
}

export async function updateActivityByCode<
  T extends UpdateArgsType<ActivityUpdateArgs>,
  S extends ActivityClient<Activity>,
  P extends ActivityGetPayload<T>,
  U extends ActivityClient<P>
>(
  activityCode: string,
  updateActivityDto: UpdateActivityDto,
  config?: T
): ReturnCheck<T, S, U> {
  const { state } = await getActivityByCode(activityCode, {
    select: { state: true },
  })
  if (state !== 'ACTIVE') {
    throw new ServiceError({
      status: 405,
      message: `La actividad con el código ${activityCode} ya no se puede editar`,
    })
  }
  const defaultConfig = getUpdateArgsConfig<ActivityUpdateArgs>(
    {
      data: updateActivityDto,
      where: { code: activityCode },
    },
    config
  )
  const updatedActivity = await prisma.activity.update(defaultConfig)
  return updatedActivity as never as CheckSelect<T, S, U>
}

export async function deleteActivityByCode<
  T extends DeleteArgsType<ActivityDeleteArgs>,
  S extends ActivityClient<Activity>,
  P extends ActivityGetPayload<T>,
  U extends ActivityClient<P>
>(activityCode: string, config?: T): ReturnCheck<T, S, U> {
  const { state } = await getActivityByCode(activityCode, {
    select: { state: true },
  })
  if (state === 'DELETED') {
    throw new ServiceError({
      status: 406,
      message: `La actividad con el código ${activityCode} ya está eliminada`,
    })
  }
  const defaultValues = getDeleteArgsConfig<ActivityDeleteArgs>(
    { where: { code: activityCode }, select: { code: true } },
    config
  )
  const deletedActivity = await prisma.activity.update({
    ...defaultValues,
    data: { state: 'DELETED' },
  })
  return deletedActivity as never as CheckSelect<T, S, U>
}
