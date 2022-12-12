import { ActivityType, Prisma, WorkOrderState } from '@prisma/client'
import { ServiceError } from '.'
import { getDateBoliviaTimeZone } from '../libs/date'
import prisma from '../libs/db'
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  validateWorkOrderState,
  WORK_ORDER_CHANGE_STATE,
} from '../schemas/workOrder'
import * as engineService from './engine.service'
import * as activityService from './activity.service'

const WORK_ORDER_INCLUDE = {
  activity: {
    select: { name: true, activityType: true },
  },
  engine: {
    select: {
      function: true,
      machine: {
        select: { code: true, area: true, name: true, criticality: true },
      },
    },
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

export async function getWorkOrders(dateRange: string) {
  if (typeof dateRange !== 'string') {
    throw new ServiceError(
      'El rango a ver según las fechas creadas de las órdenes de trabajo debe ser un texto',
      400
    )
  }
  if (!(dateRange in DateRange)) {
    throw new ServiceError(
      "El rango a ver según las fechas creadas de las órdenes de trabajo solo puede ser 'WEEKLY' | 'MONTHLY' | 'ANNUAL'",
      400
    )
  }
  const { gte, lte } = getRange(dateRange as DateRange)

  const workOrders = await prisma.workOrder.findMany({
    where: {
      createdAt: { gte, lte },
    },
    include: WORK_ORDER_INCLUDE,
    orderBy: WORK_ORDER_ORDER_BY,
  })

  return workOrders.map(({ engine: { machine, ...engine }, ...workOrder }) => ({
    ...workOrder,
    engine,
    machine,
  }))
}

export async function getWorkOrderById(workOrderId: string) {
  const id = +workOrderId
  if (isNaN(id)) {
    throw new ServiceError(
      'El código de la orden de trabajo debe ser un número',
      400
    )
  }
  const foundWorkOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: WORK_ORDER_INCLUDE,
  })
  if (!foundWorkOrder) {
    throw new ServiceError(
      `La orden de trabajo con el código '${id}' no existe`,
      404
    )
  }
  const {
    engine: { machine, ...engine },
    ...workOrder
  } = foundWorkOrder
  return { ...workOrder, engine, machine }
}

export async function createWorkOrder(createWorkOrderDto: CreateWorkOrderDto) {
  const {
    engineCode,
    activity: { code: activityCode, name: activityName, activityType },
  } = createWorkOrderDto
  if (!activityCode && (!activityName || !activityType)) {
    throw new ServiceError(
      'Se debe mandar el código de la actividad, o el nombre de actividad y su tipo',
      400
    )
  }

  const foundEngine = await engineService.getEngineByCode(engineCode)
  const { machineCode } = foundEngine
  let foundActivity
  if (activityCode) {
    foundActivity = await activityService.getActivityByCode(activityCode)
    if (machineCode !== foundActivity.machineCode) {
      throw new ServiceError(
        `El motor con el código ${engineCode} no pertenece a la misma máquina que la actividad con el código ${activityCode}`,
        412
      )
    }
  } else {
    foundActivity = await activityService.createActivity({
      activityType: activityType as ActivityType,
      machineCode,
      name: activityName as string,
    })
  }

  const createdWorkOrder = await prisma.workOrder.create({
    data: {
      engineCode,
      activityCode: foundActivity.code,
    },
    include: WORK_ORDER_INCLUDE,
  })

  const {
    engine: { machine, ...engine },
    ...workOrder
  } = createdWorkOrder
  return { ...workOrder, engine, machine }
}

export async function updateWorkOrderById(
  workOrderId: string,
  updateWorkOrderDto: UpdateWorkOrderDto
) {
  const foundWorkOrder = await getWorkOrderById(workOrderId)
  const { id, state: currentState } = foundWorkOrder
  if (currentState === 'DONE') {
    throw new ServiceError(
      `La orden de trabajo con el código '${id}' ya no puede ser editada`,
      405
    )
  }

  const { failureCause } = updateWorkOrderDto
  const {
    activity: { activityType },
  } = foundWorkOrder
  if (activityType !== 'CORRECTIVE_MAINTENANCE' && !!failureCause) {
    throw new ServiceError(
      'La causa de falla de la orden de trabajo solo es para los mantenimientos correctivos',
      400
    )
  }

  const { state: updateState } = updateWorkOrderDto
  const valid = validateWorkOrderState(currentState, updateState)
  if (!valid) {
    throw new ServiceError(
      'El estado de la orden de trabajo a actualizar es inválido',
      400
    )
  }

  const updatedWorkOrder = await prisma.workOrder.update({
    data: updateWorkOrderDto,
    where: { id },
    include: WORK_ORDER_INCLUDE,
  })

  const {
    engine: { machine, ...engine },
    ...workOrder
  } = updatedWorkOrder
  return { ...workOrder, engine, machine }
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

export async function moveToNextState(workOrderId: string) {
  const { id, state } = await getWorkOrderById(workOrderId)
  const { nextState } = WORK_ORDER_CHANGE_STATE[state]

  if (!nextState) {
    throw new ServiceError('No existe siguiente estado', 405)
  }

  const updatedWorkOrder = await prisma.workOrder.update({
    data: { state: nextState as WorkOrderState },
    where: { id },
    include: WORK_ORDER_INCLUDE,
  })
  const {
    engine: { machine, ...engine },
    ...workOrder
  } = updatedWorkOrder
  return { ...workOrder, engine, machine }
}
