import type { Activity } from '@prisma/client'
import activityData from './activities.json'
import { serverRoute } from '../helpers/api'
import { activityRoute } from '../../src/routes/activity.route'
import {
  ActivityResponseDto,
  CreateActivityDto,
  UpdateActivityDto,
} from '../../src/schemas/activity'
import { frequencies } from '../frequency/helpers'
import { activityTypes } from '../activity-type/helpers'
import { FIRST_MACHINE_CODE, machines } from '../machine/helpers'

export const activities: Activity[] = activityData as Activity[]

export const ACTIVITY_ROUTES = {
  base: `${serverRoute}${activityRoute}`,
  baseWithMachine: (machineCode: string) =>
    `${serverRoute}${activityRoute}?machineCode=${machineCode}`,
  baseWithCode: (code: string) => `${serverRoute}${activityRoute}/${code}`,
}

export const MACHINE_CODE = 'CB-03-CAL-01'
export const MACHINE_NAME =
  machines.find(({ code }) => code === MACHINE_CODE)?.name ?? ''
export const FIRST_ACTIVITY = activities[0]
export const FIRST_ACTIVITY_CODE = FIRST_ACTIVITY.code

export const CREATE_ACTIVITY_DTO: CreateActivityDto = {
  code: 'PRX200',
  machineCode: FIRST_MACHINE_CODE,
  name: 'CAMBIO DE EMPAQUETADURA DE INGRESO DE PUERTA DE CAMARA DE PREEXPANSION',
  frequency: 4320,
  activityTypeId: 1,
}
export const CREATED_ACTIVITY_RESPONSE_DTO: ActivityResponseDto = {
  code: CREATE_ACTIVITY_DTO.code,
  name: CREATE_ACTIVITY_DTO.name,
  activityType:
    activityTypes.find(({ id }) => id === CREATE_ACTIVITY_DTO.activityTypeId)
      ?.name ?? '',
  frequency: CREATE_ACTIVITY_DTO.frequency,
  pem: CREATE_ACTIVITY_DTO.pem ?? null,
}

export const UPDATE_ACTIVITY_DTO: UpdateActivityDto = {
  name: FIRST_ACTIVITY.name,
  activityTypeId: 2,
  frequency: 24,
  pem: 'PEM 001',
}
export const UPDATED_ACTIVITY_RESPONSE_DTO: ActivityResponseDto = {
  code: FIRST_ACTIVITY_CODE,
  activityType:
    activityTypes.find(({ id }) => id === UPDATE_ACTIVITY_DTO.activityTypeId)
      ?.name ?? '',
  frequency: UPDATE_ACTIVITY_DTO.frequency,
  name: UPDATE_ACTIVITY_DTO.name,
  pem: UPDATE_ACTIVITY_DTO.pem ?? null,
}

export const DELETED_ACTIVITY_RESPONSE_DTO: ActivityResponseDto = {
  code: FIRST_ACTIVITY_CODE,
  activityType:
    activityTypes.find(({ id }) => id === FIRST_ACTIVITY.activityTypeId)
      ?.name ?? '',
  name: FIRST_ACTIVITY.name,
  frequency: FIRST_ACTIVITY.frequency ?? '',
  pem: FIRST_ACTIVITY.pem ?? null,
}

const ALL_ACTIVITIES: ActivityResponseDto[] = activities
  .filter(
    ({ machineCode, deleted }) => machineCode === MACHINE_CODE && !deleted
  )
  .sort(({ code: c1 }, { code: c2 }) => c1.localeCompare(c2))
  .map(({ code, name, frequency, activityTypeId, pem }) => ({
    code,
    name,
    activityType:
      activityTypes.find(({ id }) => id === activityTypeId)?.name ?? '',
    frequency: frequency
      ? frequencies.find(({ value }) => value === frequency)?.name ??
        `${frequency} hrs`
      : undefined,
    pem: pem ?? null,
  }))

export const FILTERED_ACTIVITIES = activityTypes.map(({ id, name }) => ({
  id,
  name,
  activities: ALL_ACTIVITIES.filter(
    ({ activityType }) => activityType === name
  ),
}))
