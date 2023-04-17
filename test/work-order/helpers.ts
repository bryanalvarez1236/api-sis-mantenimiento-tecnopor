import { workOrderRoute } from '../../src/routes/workOrder.routes'
import {
  CreateWorkOrderDto,
  UpdateWorkOrderGeneralDto,
} from '../../src/schemas/workOrder'
import { serverRoute } from '../helpers/api'
import { Machine, WorkOrder } from '@prisma/client'
import workOrderData from './work-orders.json'
import { FIRST_MACHINE } from '../machine/helpers'

export const workOrders: WorkOrder[] = workOrderData as unknown as WorkOrder[]
export const CURRENT_DATE = new Date('2023-04-16')
const FIRST_DATE_MONTH = new Date('2023-04-1')
const firstDay = FIRST_DATE_MONTH.getTime()
const LAST_DATE_MONTH = new Date('2023-04-30')
const lastDay = LAST_DATE_MONTH.getTime()

export const allWorkOrders = workOrders
  .filter(({ createdAt, state }) => {
    const date = new Date(createdAt).getTime()
    const insideRange = date >= firstDay && date <= lastDay
    const isPending = date < firstDay && state !== 'DONE'
    return insideRange || isPending
  })
  .sort(
    (w1, w2) =>
      new Date(w1.createdAt).getTime() - new Date(w2.createdAt).getTime()
  )

interface WorkOrderResponseDto
  extends Omit<WorkOrder, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> {
  startDate: string | null
  endDate: string | null
  machine?: Pick<Machine, 'code' | 'name' | 'area'>
  createdAt?: string
  updatedAt?: string
}

export const WORK_ORDER_ROUTES = {
  getAll: `${serverRoute}${workOrderRoute}`,
  getById: (id: string | number) => `${serverRoute}${workOrderRoute}/${id}`,
  post: `${serverRoute}${workOrderRoute}`,
  put: (id: string | number) => `${serverRoute}${workOrderRoute}/${id}`,
  count: `${serverRoute}${workOrderRoute}/count`,
  delete: (id: string | number) => `${serverRoute}${workOrderRoute}/${id}`,
}

export const FIRST_DATE_YEAR = new Date('2023-01-01')
export const MIDDLE_DATE_MONTH = new Date('2023-04-16')

export const PAST_COMPLETED_WORK_ORDER: CreateWorkOrderDto = {
  activityType: 'ROUTINE',
  priority: 'URGENT',
  machineCode: 'CB-01-PRX-001',
  activityName: 'ORDEN DE TRABAJO PASADA COMPLETADA',
  createdAt: FIRST_DATE_YEAR,
  updatedAt: FIRST_DATE_YEAR,
}

export const PENDING_WORK_ORDER: CreateWorkOrderDto = {
  activityType: 'CORRECTIVE',
  priority: 'NORMAL',
  machineCode: 'CB-01-PRX-001',
  activityName: 'ORDEN DE TRABAJO PENDIENTE',
  createdAt: FIRST_DATE_YEAR,
  updatedAt: FIRST_DATE_YEAR,
}
export const FIRST_WORK_ORDER = workOrders[0]
export const FIRST_WORK_ORDER_RESPONSE: WorkOrderResponseDto = {
  ...FIRST_WORK_ORDER,
  startDate: FIRST_WORK_ORDER.startDate?.toISOString() ?? null,
  endDate: FIRST_WORK_ORDER.endDate?.toISOString() ?? null,
  createdAt: new Date(FIRST_WORK_ORDER.createdAt).toISOString(),
  updatedAt: new Date(FIRST_WORK_ORDER.updatedAt).toISOString(),
  machine: {
    code: FIRST_MACHINE.code,
    name: FIRST_MACHINE.name,
    area: FIRST_MACHINE.area,
  },
}

export const CURRENT_WORK_ORDER = workOrders[2]
export const UPDATE_WORK_ORDER: UpdateWorkOrderGeneralDto = {
  state: 'VALIDATED',
}
export const UPDATED_WORK_ORDER_RESPONSE: WorkOrderResponseDto = {
  ...CURRENT_WORK_ORDER,
  ...UPDATE_WORK_ORDER,
  startDate: UPDATE_WORK_ORDER.startDate?.toISOString() ?? null,
  endDate: UPDATE_WORK_ORDER.endDate?.toISOString() ?? null,
  createdAt: new Date(CURRENT_WORK_ORDER.createdAt).toISOString(),
  updatedAt: new Date(CURRENT_WORK_ORDER.updatedAt).toISOString(),
}

export const PENDING_WORK_ORDER_RESPONSE: WorkOrderResponseDto = {
  code: 2,
  ...PENDING_WORK_ORDER,
  activityName: PENDING_WORK_ORDER.activityName ?? null,
  activityCode: null,
  activityDescription: null,
  engineCode: null,
  engineFunction: null,
  failureCause: null,
  observations: null,
  protectionEquipments: [],
  securityMeasureEnds: [],
  securityMeasureStarts: [],
  state: 'PLANNED',
  storeDescription: null,
  storeUnit: null,
  startDate: null,
  endDate: null,
  totalHours: null,
  createdAt: FIRST_DATE_YEAR.toISOString(),
  updatedAt: FIRST_DATE_YEAR.toISOString(),
}

export const CREATED_WORK_ORDER: CreateWorkOrderDto = {
  activityType: 'CONDITION_CHECK',
  machineCode: 'CB-01-PRX-001',
  priority: 'IMPORTANT',
  createdAt: MIDDLE_DATE_MONTH,
  updatedAt: MIDDLE_DATE_MONTH,
}

export const CREATE_WORK_ORDER: CreateWorkOrderDto = {
  activityType: 'INSPECTION',
  priority: 'URGENT',
  machineCode: FIRST_MACHINE.code,
  activityName: 'NUEVA ORDEN DE TRABAJO',
  createdAt: CURRENT_DATE,
  updatedAt: CURRENT_DATE,
}
export const CREATED_WORK_ORDER_RESPONSE: WorkOrderResponseDto = {
  code: 3,
  ...CREATE_WORK_ORDER,
  activityCode: null,
  activityDescription: null,
  activityName: CREATE_WORK_ORDER.activityName ?? null,
  engineCode: null,
  engineFunction: null,
  failureCause: null,
  observations: null,
  protectionEquipments: [],
  securityMeasureEnds: [],
  securityMeasureStarts: [],
  state: 'PLANNED',
  storeDescription: null,
  storeUnit: null,
  startDate: null,
  endDate: null,
  totalHours: null,
  createdAt: CREATE_WORK_ORDER.createdAt?.toISOString(),
  updatedAt: CREATE_WORK_ORDER.updatedAt?.toISOString(),
}
