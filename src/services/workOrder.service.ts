import { Prisma, WorkOrderState } from '@prisma/client'
import {
  CheckSelect,
  CreateArgsType,
  FindUniqueArgs,
  FindUniqueType,
  getCreateArgsConfig,
  getFindManyArgsConfig,
  getUpdateArgsConfig,
  PromiseArray,
  ReturnCheck,
  ServiceError,
  UpdateArgsType,
} from '.'
import { getDateBoliviaTimeZone } from '../libs/date'
import prisma from '../libs/db'
import {
  CreateWorkOrderDto,
  UpdateWorkOrderGeneralDto,
  WorkOrderResponseDto,
} from '../schemas/workOrder'
import * as engineService from './engine.service'
import * as activityService from './activity.service'

type WorkOrderFindManyArgs = Prisma.WorkOrderFindManyArgs
type WorkOrderCreateArgs = Prisma.WorkOrderCreateArgs
type WorkOrderFindUniqueArgs = Prisma.WorkOrderFindUniqueArgs
type WorkOrderUpdateArgs = Prisma.WorkOrderUpdateArgs

type WorkOrderClient<T> = Prisma.Prisma__WorkOrderClient<T>
type WorkOrderGetPayload<T extends FindUniqueType<WorkOrderFindUniqueArgs>> =
  Prisma.WorkOrderGetPayload<T>

const WORK_ORDER_INCLUDE = {
  machine: {
    select: { name: true, area: true },
  },
}
const WORK_ORDER_ORDER_BY: Prisma.Enumerable<Prisma.WorkOrderOrderByWithRelationInput> =
  {
    createdAt: 'asc',
  }

enum DateRange {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

const RANGES = {
  WEEKLY: (year: number, month: number, day: number) => {
    const weekDay = new Date(year, month, day).getDay()
    const monday = day - weekDay + 1
    const sunday = monday + 6
    const gte = new Date(year, month, monday)
    const lte = new Date(year, month, sunday, 23, 59, 59)
    return { gte, lte }
  },
  MONTHLY: (year: number, month: number) => {
    const monthDays = new Date(year, month + 1, 0).getDate()
    const gte = new Date(year, month, 1)
    const lte = new Date(year, month, monthDays, 23, 59, 59)
    return { gte, lte }
  },
  ANNUAL: (year: number) => {
    const gte = new Date(year, 0)
    const lte = new Date(year, 12, 31, 23, 59, 59)
    return { gte, lte }
  },
}

function getRange(dateRange: DateRange) {
  const now = getDateBoliviaTimeZone()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  const range = RANGES[dateRange](year, month, day)
  return range
}

// interface WorkOrderWithMachineEngine {
//   include: {
//     engine: {
//       select: {
//         function: true
//       }
//     }
//     machine: {
//       select: {
//         code: true
//         area: true
//         name: true
//       }
//     }
//   }
// }

export async function getWorkOrders<
  T extends WorkOrderFindManyArgs,
  S extends PromiseArray<WorkOrderResponseDto>,
  U extends PromiseArray<WorkOrderGetPayload<T>>
>(dateRange = 'WEEKLY', config?: T): ReturnCheck<T, S, U> {
  if (typeof dateRange !== 'string') {
    throw new ServiceError({
      status: 400,
      message:
        'El rango a ver según las fechas creadas de las órdenes de trabajo debe ser un texto',
    })
  }
  if (!(dateRange in DateRange)) {
    throw new ServiceError({
      status: 400,
      message:
        "El rango a ver según las fechas creadas de las órdenes de trabajo solo puede ser 'WEEKLY' | 'MONTHLY' | 'ANNUAL'",
    })
  }
  const { gte, lte } = getRange(dateRange as DateRange)

  const defaultConfig = getFindManyArgsConfig<WorkOrderFindManyArgs>(
    {
      where: { createdAt: { gte, lte } },
      include: WORK_ORDER_INCLUDE,
      orderBy: WORK_ORDER_ORDER_BY,
    },
    config
  )

  const workOrders = await prisma.workOrder.findMany({
    ...defaultConfig,
    include: { ...config?.include, ...WORK_ORDER_INCLUDE },
  })

  return workOrders.map(
    ({ machine: { name: machineName, area: machineArea }, ...workOrder }) => ({
      ...workOrder,
      machineName,
      machineArea,
    })
  ) as never as CheckSelect<T, S, U>
}

export async function getWorkOrderById<
  T extends FindUniqueType<WorkOrderFindUniqueArgs>,
  S extends WorkOrderClient<WorkOrderResponseDto>,
  P extends WorkOrderGetPayload<T>,
  U extends WorkOrderClient<P>
>(
  workOrderId: string,
  config?: FindUniqueArgs<T, WorkOrderFindUniqueArgs>
): ReturnCheck<T, S, U> {
  console.log({ config })
  const code = +workOrderId
  if (isNaN(code)) {
    throw new ServiceError({
      status: 400,
      message: 'El código de la orden de trabajo debe ser un número',
    })
  }

  const foundWorkOrder = await prisma.workOrder.findUnique({
    where: { code },
    include: {
      machine: { select: { name: true, area: true } },
    },
  })

  if (!foundWorkOrder) {
    throw new ServiceError({
      status: 404,
      message: `La orden de trabajo con el código '${code}' no existe`,
    })
  }
  const {
    machine: { name: machineName, area: machineArea },
    ...workOrder
  } = foundWorkOrder
  return {
    ...workOrder,
    machineName,
    machineArea,
  } as never as CheckSelect<T, S, U>
}

export async function createWorkOrder<
  T extends CreateArgsType<WorkOrderCreateArgs>,
  S extends WorkOrderClient<WorkOrderResponseDto>,
  P extends WorkOrderGetPayload<T>,
  U extends WorkOrderClient<P>
>(createWorkOrderDto: CreateWorkOrderDto, config?: T): ReturnCheck<T, S, U> {
  const { engineCode, activityCode } = createWorkOrderDto

  if (engineCode) {
    const { function: engineFunction } = await engineService.getEngineByCode(
      engineCode,
      { select: { function: true } }
    )
    createWorkOrderDto.engineFunction = engineFunction
  }
  if (activityCode) {
    const { name: activityName } = await activityService.getActivityByCode(
      activityCode,
      { select: { name: true } }
    )
    createWorkOrderDto.activityName = activityName
  }

  const defaultConfig = getCreateArgsConfig<WorkOrderCreateArgs>(
    { data: createWorkOrderDto, include: WORK_ORDER_INCLUDE },
    config
  )

  const createdWorkOrder = await prisma.workOrder.create({
    ...defaultConfig,
    include: { ...config?.include, ...WORK_ORDER_INCLUDE },
  })

  const {
    machine: { name: machineName, area: machineArea },
    ...workOrder
  } = createdWorkOrder

  return {
    ...workOrder,
    machineName,
    machineArea,
  } as never as CheckSelect<T, S, U>
}

export async function updateWorkOrderById<
  T extends UpdateArgsType<WorkOrderUpdateArgs>,
  S extends WorkOrderClient<WorkOrderResponseDto>,
  P extends WorkOrderGetPayload<T>,
  U extends WorkOrderClient<P>
>(
  workOrderId: string,
  updateWorkOrderDto: UpdateWorkOrderGeneralDto,
  config?: T
): ReturnCheck<T, S, U> {
  const {
    state: currentState,
    activityType,
    code,
  } = await getWorkOrderById(workOrderId, {
    select: { state: true, activityType: true, code: true },
  })
  const { state: nextState, failureCause } = updateWorkOrderDto
  validateNextState(currentState, nextState)

  if (activityType !== 'CORRECTIVE' && !!failureCause) {
    throw new ServiceError({
      status: 400,
      message:
        'La causa de falla de la orden de trabajo solo es para los mantenimientos correctivos',
    })
  } else {
    updateWorkOrderDto.failureCause = undefined
  }

  const defaultConfig = getUpdateArgsConfig<WorkOrderUpdateArgs>(
    {
      data: { ...updateWorkOrderDto },
      where: { code },
      include: WORK_ORDER_INCLUDE,
    },
    config
  )

  const updatedWorkOrder = await prisma.workOrder.update({
    ...defaultConfig,
    include: { ...config?.include, ...WORK_ORDER_INCLUDE },
  })

  const {
    machine: { name: machineName, area: machineArea },
    ...workOrder
  } = updatedWorkOrder
  return {
    ...workOrder,
    machineName,
    machineArea,
  } as never as CheckSelect<T, S, U>
}

export async function getWorkOrdersCount() {
  const count = await prisma.workOrder.count()
  const machines = await prisma.machine.findMany({
    select: {
      code: true,
      area: true,
      name: true,
      activities: { select: { code: true, name: true, activityType: true } },
      engines: { select: { code: true, function: true } },
    },
  })

  return { count, machines }
}

// export async function moveToNextState(workOrderId: string) {
//   const { id, state } = (await getWorkOrderById(workOrderId)) as {
//     id: number
//     state: unknown
//   }
//   console.log({ state })
//   const { nextState } = WORK_ORDER_CHANGE_STATE['DOING']

//   if (!nextState) {
//     // throw new ServiceError(405, 'No existe siguiente estado')
//   }

//   const updatedWorkOrder = await prisma.workOrder.update({
//     data: { state: nextState as WorkOrderState },
//     where: { id },
//     include: WORK_ORDER_INCLUDE,
//   })
//   const {
//     engine: { machine, ...engine },
//     ...workOrder
//   } = updatedWorkOrder
//   return { ...workOrder, engine, machine }
// }

const NEXT_STATE = {
  PLANNED: 'VALIDATED',
  VALIDATED: 'DOING',
  DOING: 'DONE',
}

function validateNextState(
  currentState: WorkOrderState,
  nextState: WorkOrderState
) {
  const valid =
    NEXT_STATE[currentState as keyof typeof NEXT_STATE] === nextState
  if (!valid) {
    throw new ServiceError({
      status: 400,
      message: `No está permitido actualizar el estado ${currentState} a ${nextState}`,
    })
  }
}
