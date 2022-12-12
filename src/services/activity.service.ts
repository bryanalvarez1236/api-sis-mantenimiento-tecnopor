import { ServiceError } from '.'
import prisma from '../libs/db'
import { CreateActivityDto } from '../schemas/activity'
import * as machineService from './machine.service'

interface CreateActivityWithOptionalsDto
  extends Omit<CreateActivityDto, 'code' | 'frequency'> {
  code?: string
  frequency?: number
}

export async function getActivityByCode(activityCode: string) {
  const foundActivity = await prisma.activity.findUnique({
    where: { code: activityCode },
  })
  if (!foundActivity) {
    throw new ServiceError(
      `La actividad con el código '${activityCode}' no existe`,
      404
    )
  }
  return foundActivity
}

export async function createActivity(
  createActivityDto: CreateActivityWithOptionalsDto
) {
  const { machineCode } = createActivityDto
  await machineService.getMachineByCode(machineCode)
  return await prisma.activity.create({ data: createActivityDto })
}
