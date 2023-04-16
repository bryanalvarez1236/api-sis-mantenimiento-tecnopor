import { Activity, Prisma } from '@prisma/client'
import {
  CheckSelect,
  CreateArgsType,
  FindUniqueType,
  getCreateArgsConfig,
  getFindManyArgsConfig,
  PromiseArray,
  ReturnCheck,
  ServiceError,
} from '.'
import { getDateBoliviaTimeZone } from '../libs/date'
import prisma from '../libs/db'
import {
  CreateWorkOrderFromDraftWorkOrderDto,
  DraftWorkOrderResponseDto,
} from '../schemas/draftWorkOrder'
import { RANGES } from './workOrder.service'
import * as workOrderService from './workOrder.service'

type DraftWorkOrderFindManyArgs = Prisma.DraftWorkOrderFindManyArgs
type DraftWorkOrderCreateArgs = Prisma.DraftWorkOrderCreateArgs
type DraftWorkOrderFindUniqueArgs = Prisma.DraftWorkOrderFindUniqueArgs

type DraftWorkOrderGetPayload<
  T extends FindUniqueType<DraftWorkOrderFindUniqueArgs>
> = Prisma.DraftWorkOrderGetPayload<T>
type DraftWorkOrderClient<T> = Prisma.Prisma__DraftWorkOrderClient<T>

interface GetDraftWorkOrdersProps {
  year: number
  month: number
  day: number
}

export async function getDraftWorkOrders<
  T extends DraftWorkOrderFindManyArgs,
  S extends PromiseArray<DraftWorkOrderResponseDto>,
  U extends PromiseArray<DraftWorkOrderGetPayload<T>>
>(
  { year, month, day }: GetDraftWorkOrdersProps,
  config?: T
): ReturnCheck<T, S, U> {
  const { gte, lte } = RANGES['WEEKLY'](year, month, day)

  const defaultConfig = getFindManyArgsConfig<DraftWorkOrderFindManyArgs>(
    {
      where: { plannedDay: { gte, lte }, isCreated: false },
      orderBy: { plannedDay: 'asc' },
    },
    config
  )

  const draftWorkOrders = await prisma.draftWorkOrder.findMany({
    ...defaultConfig,
    include: {
      ...config?.include,
      machine: { select: { name: true } },
      activity: { select: { name: true } },
      workOrder: { select: { priority: true } },
    },
  })

  return draftWorkOrders.map(
    ({
      machine: { name: machineName },
      activity: { name: activityName },
      workOrder: { priority },
      ...rest
    }) => ({ machineName, activityName, priority, ...rest })
  ) as never as CheckSelect<T, S, U>
}

interface CreateDraftWorkOrderProps {
  machineCode: string
  activity: Activity
  workOrderCode: number
}

export async function createDraftWorkOrder<
  T extends CreateArgsType<DraftWorkOrderCreateArgs>,
  S extends DraftWorkOrderClient<DraftWorkOrderResponseDto>,
  P extends DraftWorkOrderGetPayload<T>,
  U extends DraftWorkOrderClient<P>
>(
  { activity, machineCode, workOrderCode }: CreateDraftWorkOrderProps,
  config?: T
): ReturnCheck<T, S, U> {
  const { code: activityCode, frequency } = activity
  if (!frequency) {
    return null as never
  }
  const plannedDay = getDateBoliviaTimeZone()
  plannedDay.setHours(plannedDay.getHours() + frequency)

  const defaultConfig = getCreateArgsConfig<DraftWorkOrderCreateArgs>(
    {
      data: { plannedDay, activityCode, machineCode, workOrderCode },
    },
    config
  )

  const createdDraftWorkOrder = await prisma.draftWorkOrder.create({
    ...defaultConfig,
    include: {
      ...config?.include,
      machine: { select: { name: true } },
      activity: { select: { name: true } },
      workOrder: { select: { priority: true } },
    },
  })

  const {
    machine: { name: machineName },
    activity: { name: activityName },
    workOrder: { priority },
    ...draftWorkOrder
  } = createdDraftWorkOrder

  return {
    ...draftWorkOrder,
    machineName,
    activityName,
    priority,
  } as never as CheckSelect<T, S, U>
}

export async function createWorkOrderFromDraftWorkOrder(
  draftWorkOrderCode: number,
  createWorkOrderFromDraftWorkOrder: CreateWorkOrderFromDraftWorkOrderDto
) {
  const draftWorkOrder = await prisma.draftWorkOrder.findUnique({
    where: { code: draftWorkOrderCode },
    include: {
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
      message: `La órden de trabajo en borrador con el código ${draftWorkOrderCode} no existe`,
    })
  }

  const { workOrder } = draftWorkOrder
  const newWorkOrder = await workOrderService.createWorkOrder({
    activityType: workOrder.activityType,
    machineCode: workOrder.machineCode,
    priority: createWorkOrderFromDraftWorkOrder.priority,
    activityCode: workOrder.activityCode ?? undefined,
    engineCode: workOrder.engineCode ?? undefined,
  })

  await prisma.draftWorkOrder.delete({ where: { code: draftWorkOrderCode } })

  return newWorkOrder
}

export async function deleteDraftWorkOrderByCode(draftWorkOrderCode: number) {
  await prisma.draftWorkOrder.delete({ where: { code: draftWorkOrderCode } })
}
