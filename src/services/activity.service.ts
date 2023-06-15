import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { ServiceError } from '.'
import prisma from '../libs/db'
import {
  ActivityResponseDto,
  CreateActivityDto,
  UpdateActivityDto,
} from '../schemas/activity'
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

async function filterByActivityType(activities: ActivityResponseDto[]) {
  const activityTypes = await prisma.activityType.findMany()
  return activityTypes.map(({ id, name }) => ({
    id,
    name,
    activities: activities.filter(({ activityType }) => activityType === name),
  }))
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
        where: { deleted: false },
        select: {
          code: true,
          name: true,
          frequency: true,
          activityType: { select: { name: true } },
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
  const frequencies = await prisma.frequency.findMany({
    select: { value: true, name: true },
  })
  const allActivities = foundMachine.activities.map(
    ({ frequency, activityType, ...rest }) => ({
      ...rest,
      frequency: frequency
        ? frequencies.find(({ value }) => value === frequency)?.name ??
          `${frequency} hrs.`
        : undefined,
      activityType: activityType.name,
    })
  )
  const activities = await filterByActivityType(allActivities)
  return { machineName: foundMachine.name, activities }
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
      activityTypeId: true,
      pem: true,
    },
  })
  if (foundActivity == null) {
    throw new ServiceError({
      status: 404,
      message: activityNotFoundMessage(code),
    })
  }
  const { pem, ...activity } = foundActivity
  const frequencies = await prisma.frequency.findMany({
    select: { name: true, value: true },
  })
  const activityTypes = await prisma.activityType.findMany()
  return {
    activity: { ...activity, pem: pem ?? undefined },
    fields: {
      frequencies: frequencies.map(({ name, value }) => ({ name, id: value })),
      activityTypes,
    },
  }
}

interface CreateActivityProps {
  createDto: CreateActivityDto
}
export async function createActivity({ createDto }: CreateActivityProps) {
  try {
    const { activityType, ...rest } = await prisma.activity.create({
      data: createDto,
      select: {
        code: true,
        name: true,
        frequency: true,
        activityType: { select: { name: true } },
        pem: true,
      },
    })
    return { ...rest, activityType: activityType.name }
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
    select: { deleted: true },
  })
  if (foundActivity == null || foundActivity.deleted) {
    throw new ServiceError({
      status: 404,
      message: activityNotFoundMessage(code),
    })
  }
  const { activityType, ...rest } = await prisma.activity.update({
    data: updateDto,
    where: { code },
    select: {
      code: true,
      name: true,
      frequency: true,
      activityType: { select: { name: true } },
      pem: true,
    },
  })
  return { ...rest, activityType: activityType.name }
}

interface DeleteActivityByCodeProps {
  code: string
}
export async function deleteActivityByCode({
  code,
}: DeleteActivityByCodeProps) {
  const foundActivity = await prisma.activity.findUnique({
    where: { code },
    select: { deleted: true },
  })
  if (foundActivity == null || foundActivity.deleted) {
    throw new ServiceError({
      status: 404,
      message: activityNotFoundMessage(code),
    })
  }
  const { activityType, ...rest } = await prisma.activity.update({
    data: { deleted: true },
    where: { code },
    select: {
      code: true,
      name: true,
      frequency: true,
      activityType: { select: { name: true } },
      pem: true,
    },
  })
  return { ...rest, activityType: activityType.name }
}

interface GetFieldsToCreateActivityProps {
  machineCode: string
}
export async function getFieldsToCreateActivity({
  machineCode,
}: GetFieldsToCreateActivityProps) {
  const machine = await prisma.machine.findUnique({
    where: { code: machineCode },
    select: { name: true },
  })
  if (machine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(machineCode),
    })
  }
  const frequencies = await prisma.frequency.findMany({
    select: { name: true, value: true },
  })
  const activityTypes = await prisma.activityType.findMany()
  return {
    machine,
    fields: {
      frequencies: frequencies.map(({ name, value }) => ({ name, id: value })),
      activityTypes,
    },
  }
}
