import { serverRoute } from './api'
import { activityRoute } from '../../src/routes/activity.route'
import { z } from 'zod'
import {
  createActivityDto,
  updateActivityDto,
} from '../../src/schemas/activity'
import { Activity } from '@prisma/client'
import { createdMachine, machineCodeNotExists } from './machine.helpers'

export const ACTIVITY_ENDPOINT = `${serverRoute}${activityRoute}`
export const activityCodeNotExists = machineCodeNotExists
export const activityNotExistsMessage = `La actividad con el código '${activityCodeNotExists}' no existe`
export const activityNotAcceptable = `La actividad no está disponible en la máquina con el código '${machineCodeNotExists}'`

type CreateActivityDto = z.infer<typeof createActivityDto>
type UpdateActivityDto = z.infer<typeof updateActivityDto>

interface ActivityResponseDto
  extends Omit<Activity, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

export const activityDate = new Date()

export const createdActivity: CreateActivityDto = {
  code: 'PRX01',
  name: 'LIMPIEZA DE TABLERO ELÉCTRICO, INSPECCIÓN DE ELEMENTOS DE FUERZA Y MANDO',
  frequency: 24 * 30 * 3,
  activityType: 'CONDITION_CHECK',
  machineCode: createdMachine.code,
}

export const newActivity: CreateActivityDto = {
  code: 'PRX02',
  name: 'MANTENIMIENTO A MOTOR AGITADOR',
  frequency: 24 * 30 * 12,
  activityType: 'PERIODIC_MAINTENANCE',
  machineCode: createdMachine.code,
}

export const updateActivity: UpdateActivityDto = {
  name: 'LIMPIEZA DE TABLERO ELÉCTRICO, INSPECCIÓN DE ELEMENTOS DE FUERZA Y MANDO',
  frequency: 24 * 30 * 4,
  activityType: 'PERIODIC_MAINTENANCE',
  machineCode: createdMachine.code,
}

export const responseCreatedActivity: ActivityResponseDto = {
  ...createdActivity,
  createdAt: activityDate.toISOString(),
  updatedAt: activityDate.toISOString(),
}

export const responseNewActivity: ActivityResponseDto = {
  ...newActivity,
  createdAt: '',
  updatedAt: '',
}

export const responseUpdateActivity: ActivityResponseDto = {
  ...responseCreatedActivity,
  ...updateActivity,
}

export const activities: ActivityResponseDto[] = [responseCreatedActivity]

export const activityAlreadyExists = `La actividad con el código '${createdActivity.code}' ya existe`
