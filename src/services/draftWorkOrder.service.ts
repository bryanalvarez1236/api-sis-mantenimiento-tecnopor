import { ServiceError } from '.'
import { RANGES, validateDate } from '../libs/date'
import prisma from '../libs/db'
import { CreateWorkOrderFromDraftWorkOrderDto } from '../schemas/draftWorkOrder'
import * as workOrderService from './workOrder.service'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

interface GetDraftWorkOrdersProps {
  date?: string
}
export async function getDraftWorkOrders({ date }: GetDraftWorkOrdersProps) {
  const validDate = validateDate(date)

  const { gte, lte } = RANGES['WEEKLY'](
    validDate.getFullYear(),
    validDate.getMonth(),
    validDate.getDate()
  )

  const draftWorkOrders = await prisma.draftWorkOrder.findMany({
    where: { plannedDay: { gte, lte } },
    orderBy: { plannedDay: 'asc' },
    select: {
      code: true,
      plannedDay: true,
      workOrder: {
        select: {
          priority: true,
          activity: { select: { name: true } },
          machine: { select: { name: true } },
        },
      },
    },
  })

  return draftWorkOrders.map(
    ({ workOrder: { priority, activity, machine }, ...draftWorkOrder }) => ({
      ...draftWorkOrder,
      priority,
      activity,
      machine,
    })
  )
}

interface CreateDraftWorkOrderProps {
  createDraftWorkOrderDto: {
    currentDate: Date
    frequency: number | null
    workOrderCode: number
  }
}
export async function createDraftWorkOrder({
  createDraftWorkOrderDto,
}: CreateDraftWorkOrderProps) {
  const { currentDate, frequency, workOrderCode } = createDraftWorkOrderDto
  if (!frequency) {
    return
  }

  const plannedDay = new Date(currentDate)
  plannedDay.setHours(currentDate.getHours() + frequency)

  const createdDraftWorkOrder = await prisma.draftWorkOrder.create({
    data: { plannedDay, workOrderCode },
    select: {
      code: true,
      plannedDay: true,
      workOrder: {
        select: {
          priority: true,
          activity: { select: { name: true } },
          machine: { select: { name: true } },
        },
      },
    },
  })

  const {
    workOrder: { priority, activity, machine },
    ...draftWorkOrder
  } = createdDraftWorkOrder

  return {
    ...draftWorkOrder,
    priority,
    activity,
    machine,
  }
}

interface CreateWorkOrderFromDraftWorkOrderProps {
  id: number
  createWorkOrderFromDraftWorkOrder: CreateWorkOrderFromDraftWorkOrderDto
}
export async function createWorkOrderFromDraftWorkOrder({
  id,
  createWorkOrderFromDraftWorkOrder,
}: CreateWorkOrderFromDraftWorkOrderProps) {
  try {
    const draftWorkOrder = await prisma.draftWorkOrder.findUnique({
      where: { code: id },
      select: {
        workOrder: {
          select: {
            machineCode: true,
            engineCode: true,
            activityCode: true,
            activityType: true,
          },
        },
      },
    })
    if (!draftWorkOrder) {
      throw new ServiceError({
        status: 404,
        message: `La órden de trabajo en borrador con el código ${id} no existe`,
      })
    }
    const { workOrder } = draftWorkOrder
    const newWorkOrder = await workOrderService.createWorkOrder({
      createWorkOrderDto: {
        activityType: workOrder.activityType,
        machineCode: workOrder.machineCode,
        priority: createWorkOrderFromDraftWorkOrder.priority,
        activityCode: workOrder.activityCode ?? undefined,
        engineCode: workOrder.engineCode ?? undefined,
      },
    })
    await prisma.draftWorkOrder.delete({ where: { code: id } })
    return newWorkOrder
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error
    }
    throw new ServiceError({ status: 500 })
  }
}

interface DeleteDraftWorkOrderByIdProps {
  id: number
}
export async function deleteDraftWorkOrderByCode({
  id,
}: DeleteDraftWorkOrderByIdProps) {
  try {
    const { code } = await prisma.draftWorkOrder.delete({
      where: { code: id },
    })
    return { code }
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new ServiceError({
        status: 404,
        message: `La órden de trabjo en borrador #${id} no existe`,
      })
    }
    throw new ServiceError({ status: 500 })
  }
}
