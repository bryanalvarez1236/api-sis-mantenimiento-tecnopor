import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { ServiceError } from '.'
import prisma from '../libs/db'
import { CreateActivityDto, UpdateActivityDto } from '../schemas/activity'
import { machineNotFoundMessage } from './machine.service'

export function activityNotFoundMessage(activityCode: string) {
  return `La actividad con el código '${activityCode}' no existe`
}
export function activityAlreadyExistsMessage(activityCode: string) {
  return `La actividad con el código '${activityCode}' ya existe`
}
export function activityNotEditMessage(activityCode: string) {
  return `La actividad con el código ${activityCode} no puede ser editada`
}
export function activityAlreadyDeleteMessage(activityCode: string) {
  return `La actividad con el código ${activityCode} ya está eliminada`
}

interface GetMachineActivitiesProps {
  machineCode: string
}
export async function getMachineActivities({
  machineCode,
}: GetMachineActivitiesProps) {
  const foundMachine = await prisma.machine.findUnique({
    where: { code: machineCode },
    select: {
      name: true,
      activities: {
        where: { state: 'ACTIVE' },
        select: {
          code: true,
          name: true,
          frequency: true,
          activityType: true,
          pem: true,
        },
        orderBy: { code: 'asc' },
      },
    },
  })
  if (foundMachine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(machineCode),
    })
  }
  const { activities, name } = foundMachine
  return { activities, machineName: name }
}

interface GetActivityByCodeProps {
  code: string
}
export async function getActivityByCode({ code }: GetActivityByCodeProps) {
  const foundActivity = await prisma.activity.findUnique({
    where: { code },
    select: {
      code: true,
      name: true,
      frequency: true,
      activityType: true,
      pem: true,
    },
  })
  if (foundActivity == null) {
    throw new ServiceError({
      status: 404,
      message: activityNotFoundMessage(code),
    })
  }
  return foundActivity
}

interface CreateActivityProps {
  createDto: CreateActivityDto
}
export async function createActivity({ createDto }: CreateActivityProps) {
  try {
    return await prisma.activity.create({
      data: createDto,
      select: {
        code: true,
        name: true,
        frequency: true,
        activityType: true,
        pem: true,
      },
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ServiceError({
          status: 409,
          message: activityAlreadyExistsMessage(createDto.code),
        })
      }
      if (error.code === 'P2003') {
        throw new ServiceError({
          status: 404,
          message: machineNotFoundMessage(createDto.machineCode),
        })
      }
    }
    throw new ServiceError({ status: 500 })
  }
}

interface UpdateActivityByCodeProps {
  code: string
  updateDto: UpdateActivityDto
}
export async function updateActivityByCode({
  code,
  updateDto,
}: UpdateActivityByCodeProps) {
  const foundActivity = await prisma.activity.findUnique({
    where: { code },
    select: { state: true },
  })
  if (foundActivity == null) {
    throw new ServiceError({
      status: 404,
      message: activityNotFoundMessage(code),
    })
  }
  const { state } = foundActivity
  if (state !== 'ACTIVE') {
    throw new ServiceError({
      status: 405,
      message: activityNotEditMessage(code),
    })
  }
  return await prisma.activity.update({
    data: updateDto,
    where: { code },
    select: {
      code: true,
      name: true,
      frequency: true,
      activityType: true,
      pem: true,
    },
  })
}

interface DeleteActivityByCodeProps {
  code: string
}
export async function deleteActivityByCode({
  code,
}: DeleteActivityByCodeProps) {
  const foundActivity = await prisma.activity.findUnique({
    where: { code },
    select: { state: true },
  })
  if (foundActivity == null) {
    throw new ServiceError({
      status: 404,
      message: activityNotFoundMessage(code),
    })
  }
  const { state } = foundActivity
  if (state === 'DELETED') {
    throw new ServiceError({
      status: 406,
      message: activityAlreadyDeleteMessage(code),
    })
  }
  return await prisma.activity.update({
    data: { state: 'DELETED' },
    where: { code },
    select: {
      code: true,
      name: true,
      frequency: true,
      activityType: true,
      pem: true,
    },
  })
}
