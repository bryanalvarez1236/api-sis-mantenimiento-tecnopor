import { PrismaClientValidationError } from '@prisma/client/runtime'
import { ServiceError } from '.'
import { RANGES, validateDate } from '../libs/date'
import prisma from '../libs/db'
import {
  CreateWorkOrderDto,
  UpdateWorkOrderGeneralDto,
  getNextState,
  isInspection,
} from '../schemas/workOrder'
import { getEngineByCode } from './engine.service'
import { getActivityByCode } from './activity.service'
import { createDraftWorkOrder } from './draftWorkOrder.service'

export function workOrderNotFoundMessage(workOrderId: number) {
  return `La órden de trabajo con el código ${workOrderId} no existe`
}
export function workOrderNotDeleteMessage(workOrderId: number) {
  return `No se puede eliminar la órden de trabajo '${workOrderId}'`
}
export const WORK_ORDER_INVALID_ID_MESSAGE =
  'El código de la órden de trabajo debe ser un número'

interface GetWorkOrdersProps {
  date?: string
}
export async function getWorkOrders({ date }: GetWorkOrdersProps) {
  const validDate = validateDate(date)

  const { gte, lte } = RANGES.MONTHLY(
    validDate.getFullYear(),
    validDate.getMonth()
  )

  const workOrders = await prisma.workOrder.findMany({
    where: {
      OR: [
        { createdAt: { gte, lte } },
        { createdAt: { lt: gte }, state: { not: 'DONE' } },
        { updatedAt: { gte, lte }, state: 'DONE' },
      ],
    },
    orderBy: { createdAt: 'asc' },
    select: {
      code: true,
      activityName: true,
      activityType: true,
      priority: true,
      createdAt: true,
      state: true,
      machine: { select: { name: true, checkList: { take: 1 } } },
    },
  })

  return workOrders.map(
    ({
      machine: { checkList, ...machine },
      activityType,
      activityName,
      state,
      ...workOrder
    }) => ({
      ...workOrder,
      activityName,
      machine,
      state,
      nextState: getNextState({ activityName, activityType, checkList, state }),
    })
  )
}

interface GetWorkOrderByIdProps {
  id: number
}
export async function getWorkOrderById({ id }: GetWorkOrderByIdProps) {
  try {
    const foundWorkOrder = await prisma.workOrder.findUnique({
      where: { code: id },
      include: {
        machine: {
          select: {
            name: true,
            checkList: true,
            area: { select: { name: true } },
          },
        },
        checkListVerified: true,
      },
    })
    if (!foundWorkOrder) {
      throw new ServiceError({
        status: 404,
        message: workOrderNotFoundMessage(id),
      })
    }
    const {
      activityName,
      activityType,
      machine: { checkList, ...machine },
      state,
      ...workOrder
    } = foundWorkOrder
    return {
      ...workOrder,
      machine: {
        ...machine,
        ...(isInspection({ activityName, activityType, checkList }) &&
        state === 'DOING'
          ? { checkList }
          : {}),
      },
      activityName,
      activityType,
      state,
      nextState: getNextState({ activityName, activityType, checkList, state }),
    }
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error
    }
    if (error instanceof PrismaClientValidationError) {
      throw new ServiceError({
        status: 400,
        message: WORK_ORDER_INVALID_ID_MESSAGE,
      })
    }
    throw new ServiceError({ status: 500 })
  }
}

interface CreateWorkOrderProps {
  createWorkOrderDto: CreateWorkOrderDto
}
export async function createWorkOrder({
  createWorkOrderDto,
}: CreateWorkOrderProps) {
  const { engineCode, activityCode } = createWorkOrderDto

  if (engineCode) {
    const { function: engineFunction } = await getEngineByCode({
      code: engineCode,
    })
    createWorkOrderDto.engineFunction = engineFunction
  }
  if (activityCode) {
    const { name: activityName } = await getActivityByCode({
      code: activityCode,
    })
    createWorkOrderDto.activityName = activityName
  }

  try {
    return await prisma.workOrder.create({
      data: createWorkOrderDto,
    })
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}

interface UpdateWorkOrderByIdProps {
  id: number
  updateWorkOrderDto: UpdateWorkOrderGeneralDto
}
export async function updateWorkOrderById({
  id,
  updateWorkOrderDto,
}: UpdateWorkOrderByIdProps) {
  const {
    activityType,
    code,
    nextState: nextState,
    updatedAt,
  } = await getWorkOrderById({ id })

  if (nextState == null || nextState !== updateWorkOrderDto.state) {
    throw new ServiceError({
      status: 405,
      message: `No se puede actualizar la órden de trabajo '${id}'`,
    })
  }

  const { failureCause } = updateWorkOrderDto
  if (activityType !== 'CORRECTIVE' && failureCause != null) {
    updateWorkOrderDto.failureCause = undefined
  }

  const { checkListVerified, ...restUpdate } = updateWorkOrderDto

  try {
    if (checkListVerified) {
      const data = checkListVerified.map((checkList) => ({
        ...checkList,
        workOrderCode: code,
      }))
      await prisma.checkListVerified.createMany({ data })
      const now = new Date()
      const totalHours =
        (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
      restUpdate.totalHours = Math.ceil(totalHours)
      if (restUpdate.endDate == null) {
        restUpdate.endDate = now
      }
    }
    const { activity, ...updatedWorkOrder } = await prisma.workOrder.update({
      where: { code: id },
      data: restUpdate,
      select: {
        code: true,
        activityName: true,
        priority: true,
        createdAt: true,
        state: true,
        machine: { select: { name: true, checkList: { take: 1 } } },
        activity:
          updateWorkOrderDto.state === 'DONE' &&
          activityType === 'PLANNED_PREVENTIVE',
      },
    })
    if (activity != null && updateWorkOrderDto.endDate != null) {
      const { frequency } = activity
      const { endDate: currentDate } = updateWorkOrderDto
      await createDraftWorkOrder({
        createDraftWorkOrderDto: { currentDate, frequency, workOrderCode: id },
      })
    }
    const {
      activityName,
      machine: { checkList, ...machine },
      state,
      ...workOrder
    } = updatedWorkOrder
    return {
      ...workOrder,
      activityName,
      machine,
      state,
      nextState: getNextState({ activityName, activityType, checkList, state }),
    }
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error
    }
    throw new ServiceError({ status: 500 })
  }
}

export async function getWorkOrdersCount() {
  try {
    const [{ count }]: [{ count: BigInteger }] =
      await prisma.$queryRaw`SELECT last_value as count FROM "WorkOrder_code_seq"`

    const machines = await prisma.machine.findMany({
      select: {
        code: true,
        name: true,
        area: { select: { name: true } },
        activities: { select: { code: true, name: true, activityType: true } },
        engines: { select: { code: true, function: true } },
      },
    })
    return {
      count: Number(count),
      machines,
    }
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}

interface DeleteWorkOrderByIdProps {
  id: number
}
export async function deleteWorkOrderById({ id }: DeleteWorkOrderByIdProps) {
  const { state } = await getWorkOrderById({ id })
  if (state === 'DONE') {
    throw new ServiceError({
      status: 405,
      message: workOrderNotDeleteMessage(id),
    })
  }

  try {
    const { code } = await prisma.workOrder.delete({
      where: { code: id },
    })
    return { code }
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}
