import {
  CheckList,
  WorkOrderActivityType,
  WorkOrderState,
} from '@prisma/client'
import { ServiceError } from '.'
import prisma from '../libs/db'
import {
  CreateWorkOrderDto,
  UpdateWorkOrderGeneralDto,
} from '../schemas/workOrder'
import * as engineService from './engine.service'
import * as activityService from './activity.service'
import * as draftWorkOrderService from './draftWorkOrder.service'
import { PrismaClientValidationError } from '@prisma/client/runtime'

export const RANGES = {
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

const NEXT_STATE = {
  [WorkOrderState.PLANNED]: WorkOrderState.VALIDATED,
  [WorkOrderState.VALIDATED]: WorkOrderState.DOING,
  [WorkOrderState.DOING]: WorkOrderState.DONE,
}

interface IsInspectionProps {
  activityName: string | null
  activityType: WorkOrderActivityType
  checkList: CheckList[]
}
function isInspection({
  activityName,
  activityType,
  checkList,
}: IsInspectionProps) {
  return (
    checkList.length > 0 &&
    activityName?.replace('Ó', 'O') === 'INSPECCION' &&
    activityType === 'INSPECTION'
  )
}

interface GetNextStateProps extends IsInspectionProps {
  state: WorkOrderState
}
function getNextState({
  activityName,
  activityType,
  checkList,
  state,
}: GetNextStateProps) {
  if (
    state === 'PLANNED' &&
    isInspection({ activityName, activityType, checkList })
  ) {
    return 'DOING'
  }
  return NEXT_STATE[state as keyof typeof NEXT_STATE]
}

interface GetWorkOrdersProps {
  date?: string
}
export async function getWorkOrders({ date }: GetWorkOrdersProps) {
  if (date == null || !/^(\d{1,2}\/){2}\d{4}$/.test(date)) {
    throw new ServiceError({
      status: 400,
      message: 'La fecha indicada es inválida',
    })
  }

  const userDate = new Date(date)
  const { gte, lte } = RANGES.MONTHLY(
    userDate.getFullYear(),
    userDate.getMonth()
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
        machine: { select: { name: true, area: true, checkList: true } },
        checkListVerified: true,
      },
    })
    if (!foundWorkOrder) {
      throw new ServiceError({
        status: 404,
        message: `La órden de trabajo con el código ${id} no existe`,
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
        message: 'El código de la órden de trabajo debe ser un número',
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
    machineCode,
    nextState: nextState,
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
    if (activity != null) {
      await draftWorkOrderService.createDraftWorkOrder({
        activity,
        machineCode,
        workOrderCode: code,
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
        area: true,
        name: true,
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
      message: `No se puede eliminar la órden de trabajo '${id}'`,
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
