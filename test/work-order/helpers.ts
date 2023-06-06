import { workOrderRoute } from '../../src/routes/workOrder.routes'
import {
  CreateWorkOrderDto,
  UpdateWorkOrderGeneralDto,
  getNextState,
} from '../../src/schemas/workOrder'
import { serverRoute } from '../helpers/api'
import type {
  Area,
  CheckListVerified,
  Machine,
  WorkOrder,
  WorkOrderState,
} from '@prisma/client'
import workOrderData from './work-orders.json'
import { FIRST_MACHINE, areas, machines } from '../machine/helpers'
import { MACHINE_CODE } from '../store/helpers'

export const workOrders: WorkOrder[] = workOrderData as unknown as WorkOrder[]
export const CURRENT_DATE = new Date('2023-04-16')
const FIRST_DATE_MONTH = new Date('2023-04-1')
const firstDay = FIRST_DATE_MONTH.getTime()
const LAST_DATE_MONTH = new Date('2023-04-30')
const lastDay = LAST_DATE_MONTH.getTime()

interface WorkOrderResponseDto
  extends Omit<WorkOrder, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> {
  startDate: string | null
  endDate: string | null
  machine?: Pick<Machine, 'name'> & { area: Pick<Area, 'name'> }
  checkListVerified?: CheckListVerified[]
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
export const FIRST_WORK_ORDER_ID = FIRST_WORK_ORDER.code
export const SECOND_WORK_ORDER_ID = workOrders[1].code
export const FIRST_WORK_ORDER_RESPONSE: WorkOrderResponseDto = {
  ...FIRST_WORK_ORDER,
  startDate: new Date(FIRST_WORK_ORDER.startDate ?? '').toISOString() ?? null,
  endDate: new Date(FIRST_WORK_ORDER.endDate ?? '').toISOString() ?? null,
  createdAt: new Date(FIRST_WORK_ORDER.createdAt).toISOString(),
  updatedAt: new Date(FIRST_WORK_ORDER.updatedAt).toISOString(),
  machine: {
    name: FIRST_MACHINE.name,
    area: {
      name: areas.find(({ id }) => id === FIRST_MACHINE.areaId)?.name ?? '',
    },
  },
  onSchedule: null,
  checkListVerified: [],
}

export const CURRENT_WORK_ORDER = workOrders[1]
export const UPDATE_WORK_ORDER: UpdateWorkOrderGeneralDto = {
  securityMeasureStarts: [],
  protectionEquipments: [],
  activityDescription: 'ESTA ES UNA DESCRIPCION',
  stores: [
    { name: 'ANILLO DE GOMA', amount: 5 },
    { name: 'SELLO DE NITRILO', amount: 32 },
    { name: 'SELLO DE NITRILO', amount: 20 },
    { name: 'NUEVO REPUESTO', amount: 2 },
  ],
  totalHours: 14,
  securityMeasureEnds: [],
  state: 'DONE',
  endDate: new Date(),
  checkListVerified: [],
}
export const UPDATED_WORK_ORDER_RESPONSE = {
  code: CURRENT_WORK_ORDER.code,
  priority: CURRENT_WORK_ORDER.priority,
  createdAt: new Date(CURRENT_WORK_ORDER.createdAt).toISOString(),
  activityName: CURRENT_WORK_ORDER.activityName,
  machine: { name: FIRST_MACHINE.name },
  nextState: 'DOING',
  ...UPDATE_WORK_ORDER,
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
  startDate: null,
  endDate: null,
  totalHours: null,
  daySchedule: null,
  onSchedule: null,
  createdAt: CREATE_WORK_ORDER.createdAt?.toISOString(),
  updatedAt: CREATE_WORK_ORDER.updatedAt?.toISOString(),
}

export const ALL_WORK_ORDERS = workOrders
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
  .map(
    ({
      code,
      activityName,
      activityType,
      priority,
      createdAt,
      state,
      machineCode,
    }) => {
      const machineName = machines.find(
        ({ code }) => code === machineCode
      )?.name
      return {
        code,
        activityName,
        priority,
        createdAt,
        state: state ?? 'PLANNED',
        machine: { name: machineName },
        nextState: getNextState({
          activityName,
          activityType,
          checkList: [],
          state: state ?? 'PLANNED',
        }),
      }
    }
  )

export const WORK_ORDER_CODE_TO_UPDATE = 0
export const WORK_ORDER_TO_UPDATE: CreateWorkOrderDto & {
  code: number
  state: WorkOrderState
} = {
  code: WORK_ORDER_CODE_TO_UPDATE,
  state: 'DOING',
  activityType: 'CONDITION_CHECK',
  machineCode: MACHINE_CODE,
  priority: 'NORMAL',
  activityName: 'ORDEN DE TRABAJO PARA ACTUALIZAR',
}
