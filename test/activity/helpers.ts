import type { Activity, ActivityType } from '@prisma/client'
import activityData from './activities.json'
import { serverRoute } from '../helpers/api'
import { activityRoute } from '../../src/routes/activity.route'
import { FIRST_MACHINE_CODE } from '../machine/helpers'
import {
  CreateActivityDto,
  UpdateActivityDto,
} from '../../src/schemas/activity'

interface ActivityResponseDto extends Pick<Activity, 'code' | 'name'> {
  frequency?: number | null
  activityType?: ActivityType
  pem?: string | null
}

export const activities: Activity[] = activityData as Activity[]
export const FIRST_ACTIVITY = activities[0]
export const FIRST_ACTIVITY_CODE = FIRST_ACTIVITY.code
export const FIRST_ACTIVITY_RESPONSE_DTO: ActivityResponseDto = {
  code: FIRST_ACTIVITY.code,
  name: FIRST_ACTIVITY.name,
  activityType: FIRST_ACTIVITY.activityType,
  frequency: FIRST_ACTIVITY.frequency,
  pem: FIRST_ACTIVITY.pem ?? null,
}

export const ACTIVITY_ROUTES = {
  base: `${serverRoute}${activityRoute}`,
  baseWithMachine: (machineCode: string) =>
    `${serverRoute}${activityRoute}?machineCode=${machineCode}`,
  baseWithCode: (code: string) => `${serverRoute}${activityRoute}/${code}`,
}

export const CREATE_ACTIVITY_DTO: CreateActivityDto = {
  code: 'PRX20',
  machineCode: FIRST_MACHINE_CODE,
  name: 'CAMBIO DE EMPAQUETADURA DE INGRESO DE PUERTA DE CAMARA DE PREEXPANSION',
  frequency: 4320,
  activityType: 'PERIODIC_MAINTENANCE',
}
export const CREATED_ACTIVITY_RESPONSE_DTO: ActivityResponseDto = {
  code: CREATE_ACTIVITY_DTO.code,
  name: CREATE_ACTIVITY_DTO.name,
  activityType: CREATE_ACTIVITY_DTO.activityType,
  frequency: CREATE_ACTIVITY_DTO.frequency,
  pem: CREATE_ACTIVITY_DTO.pem ?? null,
}

export const UPDATE_ACTIVITY_DTO: UpdateActivityDto = {
  name: FIRST_ACTIVITY.name,
  activityType: 'VISUAL_INSPECTIONS',
  frequency: 24,
  pem: 'PEM 001',
}
export const UPDATED_ACTIVITY_RESPONSE_DTO: ActivityResponseDto = {
  ...UPDATE_ACTIVITY_DTO,
  code: FIRST_ACTIVITY_CODE,
}

export const ALL_ACTIVITIES: ActivityResponseDto[] = activities
  .filter(
    ({ machineCode, state }) =>
      machineCode === FIRST_MACHINE_CODE &&
      state !== 'DELETED' &&
      state !== 'INNACTIVE'
  )
  .sort(({ code: c1 }, { code: c2 }) => c1.localeCompare(c2))
  .map(({ code, name, frequency, activityType, pem }) => ({
    code,
    name,
    activityType,
    frequency: frequency ?? null,
    pem: pem ?? null,
  }))
