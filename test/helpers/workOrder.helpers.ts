import {
  Activity,
  Engine,
  Machine,
  WorkOrder,
  WorkOrderState,
} from '@prisma/client'
import { workOrderRoute } from '../../src/routes/workOrder.routes'
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
} from '../../src/schemas/workOrder'
import { createdActivity } from './activity.helpers'
import { serverRoute } from './api'
import { createdEngine } from './engine.helpers'
import { createdMachine } from './machine.helpers'

export const workOrderEndDate = new Date()

export const workOrderDate = new Date('11/29/2022 12:00:00')
const firstDateWeek = new Date('11/28/2022 00:00:00')
const lastDateWeek = new Date('12/04/2022 23:59:59')

const firstDateMonth = new Date('11/01/2022 00:00:00')
const lastDateMonth = new Date('11/30/2022 23:59:59')

const firstDateYear = new Date('01/01/2022 00:00:00')
const lastDateYear = new Date('12/31/2022 23:59:59')

const dateOtherMonth = new Date('10/01/2022 00:00:00')
const dateOtherYear = new Date('12/31/2021 23:59:59')

export const WORK_ORDER_ENDPOINT = `${serverRoute}${workOrderRoute}`
export const WORK_ORDER_ID_NOT_EXISTS = -1
export const WORK_ORDER_NOT_EXISTS_MESSAGE = `La orden de trabajo con el código '${WORK_ORDER_ID_NOT_EXISTS}' no existe`
export const WORK_ORDER_INVALID_ID =
  'El código de la orden de trabajo debe ser un número'
export const WORK_ORDER_INVALID_ACTIVITY =
  'Se debe mandar el código de la actividad, o el nombre de actividad y su tipo'
export const WORK_ORDER_INVALID_MACHINE_CODE = `El motor con el código ${createdEngine.code} no pertenece a la misma máquina que la actividad con el código ${createdActivity.code}`
export const WORK_ORDER_INVALID_NEXT_STATE_MESSAGE =
  'El estado de la orden de trabajo a actualizar es inválido'

export interface WorkOrderResponseDto
  extends Omit<
    WorkOrder,
    'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'failureCause'
  > {
  startDate?: string
  endDate?: string
  failureCause?: string
  createdAt: string
  updatedAt: string
  machine: Pick<Machine, 'code' | 'area' | 'name' | 'criticality'>
  activity: Pick<Activity, 'name' | 'activityType'>
  engine: Pick<Engine, 'function'>
  nextState?: WorkOrderState
  previousState?: WorkOrderState
}

export const workOrderInvalidActivity: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: { name: 'INVALID ACTIVITY' },
}

const workOrderWeek: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'ORDEN DE TRABAJO DE LA SEMANA',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}
export const responseWorkOrderWeek: WorkOrderResponseDto = {
  id: 1,
  engineCode: workOrderWeek.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: workOrderDate.toISOString(),
  updatedAt: workOrderDate.toISOString(),
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: workOrderWeek.activity.name as string,
    activityType:
      workOrderWeek.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

const workOrderMonday: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'ORDEN DE TRABAJO DEL LUNES',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}
const responseWorkOrderMonday: WorkOrderResponseDto = {
  id: 1,
  engineCode: workOrderMonday.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: firstDateWeek.toISOString(),
  updatedAt: firstDateWeek.toISOString(),
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: workOrderMonday.activity.name as string,
    activityType:
      workOrderMonday.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

const workOrderSunday: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'ORDEN DE TRABAJO DEL DOMINGO',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}
const responseWorkOrderSunday: WorkOrderResponseDto = {
  id: 1,
  engineCode: workOrderSunday.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: lastDateWeek.toISOString(),
  updatedAt: lastDateWeek.toISOString(),
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: workOrderSunday.activity.name as string,
    activityType:
      workOrderSunday.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

const firstWorkOrderMonth: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'PRIMER ORDEN DE TRABAJO DEL MES',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}
const responseFirstWorkOrderMonth: WorkOrderResponseDto = {
  id: 1,
  engineCode: firstWorkOrderMonth.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: firstDateMonth.toISOString(),
  updatedAt: firstDateMonth.toISOString(),
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: firstWorkOrderMonth.activity.name as string,
    activityType:
      firstWorkOrderMonth.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

const lastWorkOrderMonth: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'ULTIMO ORDEN DE TRABAJO DEL MES',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}
const responseLastWorkOrderMonth: WorkOrderResponseDto = {
  id: 1,
  engineCode: lastWorkOrderMonth.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: lastDateMonth.toISOString(),
  updatedAt: lastDateMonth.toISOString(),
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: lastWorkOrderMonth.activity.name as string,
    activityType:
      lastWorkOrderMonth.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

const firstWorkOrderYear: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'PRIMER ORDEN DE TRABAJO DEL AÑO',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}
const responseFirstWorkOrderYear: WorkOrderResponseDto = {
  id: 1,
  engineCode: firstWorkOrderYear.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: firstDateYear.toISOString(),
  updatedAt: firstDateYear.toISOString(),
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: firstWorkOrderYear.activity.name as string,
    activityType:
      firstWorkOrderYear.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

const lastWorkOrderYear: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'ULTIMO ORDEN DE TRABAJO DEL AÑO',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}
const responseLastWorkOrderYear: WorkOrderResponseDto = {
  id: 1,
  engineCode: lastWorkOrderYear.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: lastDateYear.toISOString(),
  updatedAt: lastDateYear.toISOString(),
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: lastWorkOrderYear.activity.name as string,
    activityType:
      lastWorkOrderYear.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

const workOrderOtherMonth: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'ORDEN DE TRABAJO DE OTRO MES',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}
const responseWorkOrderOtherMonth: WorkOrderResponseDto = {
  id: 1,
  engineCode: workOrderOtherMonth.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: dateOtherMonth.toISOString(),
  updatedAt: dateOtherMonth.toISOString(),
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: workOrderOtherMonth.activity.name as string,
    activityType:
      workOrderOtherMonth.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

const workOrderOtherYear: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'ORDEN DE TRABAJO DE OTRO AÑO',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}

export const createdWorkOrders = [
  {
    date: workOrderDate,
    workOrder: workOrderWeek,
  },
  {
    date: firstDateWeek,
    workOrder: workOrderMonday,
  },
  {
    date: lastDateWeek,
    workOrder: workOrderSunday,
  },
  {
    date: firstDateMonth,
    workOrder: firstWorkOrderMonth,
  },
  {
    date: lastDateMonth,
    workOrder: lastWorkOrderMonth,
  },
  {
    date: firstDateYear,
    workOrder: firstWorkOrderYear,
  },
  {
    date: lastDateYear,
    workOrder: lastWorkOrderYear,
  },
  {
    date: dateOtherMonth,
    workOrder: workOrderOtherMonth,
  },
  {
    date: dateOtherYear,
    workOrder: workOrderOtherYear,
  },
]

export const newWorkOrder: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: 'NUEVA ORDEN DE TRABAJO',
    activityType: 'CORRECTIVE_MAINTENANCE',
  },
}

export const newWorkOrderWithActivityExists: CreateWorkOrderDto = {
  engineCode: createdEngine.code,
  activity: {
    name: createdActivity.name,
    activityType: createdActivity.activityType,
    code: createdActivity.code,
  },
}

export const responseWorkOrdersWeek: WorkOrderResponseDto[] = [
  responseWorkOrderMonday,
  responseWorkOrderWeek,
  responseLastWorkOrderMonth,
  responseWorkOrderSunday,
]
export const responseWorkOrdersMoth: WorkOrderResponseDto[] = [
  responseFirstWorkOrderMonth,
  ...responseWorkOrdersWeek.slice(0, 3),
]
export const responseWorkOrdersYear: WorkOrderResponseDto[] = [
  responseFirstWorkOrderYear,
  responseWorkOrderOtherMonth,
  responseFirstWorkOrderMonth,
  ...responseWorkOrdersWeek,
  responseLastWorkOrderYear,
]

export const responseNewWorkOrder: WorkOrderResponseDto = {
  id: 1,
  engineCode: newWorkOrder.engineCode,
  activityCode: '',
  state: 'PLANNED',
  createdAt: '',
  updatedAt: '',
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: newWorkOrder.activity.name as string,
    activityType:
      newWorkOrder.activity.activityType ?? 'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

export const responseNewWorkOrderWithActivityExists: WorkOrderResponseDto = {
  id: 1,
  engineCode: newWorkOrderWithActivityExists.engineCode,
  activityCode: newWorkOrderWithActivityExists.activity.code as string,
  state: 'PLANNED',
  createdAt: '',
  updatedAt: '',
  machine: {
    code: createdMachine.code,
    area: createdMachine.area,
    name: createdMachine.name,
    criticality: createdMachine.criticality,
  },
  activity: {
    name: newWorkOrderWithActivityExists.activity.name as string,
    activityType:
      newWorkOrderWithActivityExists.activity.activityType ??
      'CORRECTIVE_MAINTENANCE',
  },
  engine: { function: createdEngine.function },
  nextState: 'VALIDATED',
}

export const updateWorkOrder: UpdateWorkOrderDto = {
  state: 'VALIDATED',
  startDate: workOrderDate,
  endDate: workOrderEndDate,
  failureCause: 'CAUSA DE LA ORDEN DE TRABAJO',
}

export const responseUpdateWorkOrder: WorkOrderResponseDto = {
  ...responseWorkOrderWeek,
  state: updateWorkOrder.state,
  startDate: workOrderDate.toISOString(),
  endDate: workOrderEndDate.toISOString(),
  failureCause: updateWorkOrder.failureCause,
  nextState: 'DOING',
  previousState: 'PLANNED',
}
