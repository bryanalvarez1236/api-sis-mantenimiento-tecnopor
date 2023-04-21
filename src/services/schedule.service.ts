import { Prisma } from '@prisma/client'
import { ServiceError } from '.'
import { validateDate } from '../libs/date'
import prisma from '../libs/db'
import { RANGES } from './workOrder.service'
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime'

export interface WorkOrderOnScheduleDto {
  daySchedule?: Date
  onSchedule?: boolean
}

interface GetScheduleProps {
  date?: string
  strict?: string
}
export async function getSchedule({ date, strict }: GetScheduleProps) {
  const validDate = validateDate(date)
  if (!validDate) {
    throw new ServiceError({
      status: 400,
      message:
        'La fecha indicada es inválida el formato para la fecha es "MM/DD/YYYY" o "MM/DD/YYYY HH:mm:ss"',
    })
  }

  const weekly = RANGES['WEEKLY'](
    validDate.getFullYear(),
    validDate.getMonth(),
    validDate.getDate()
  )

  const monthly = RANGES.MONTHLY(validDate.getFullYear(), validDate.getMonth())

  let where: Prisma.WorkOrderWhereInput = {
    daySchedule: { ...weekly },
  }
  if (strict === 'false') {
    where = {
      OR: [
        { ...where },
        { daySchedule: null, onSchedule: true },
        {
          daySchedule: null,
          OR: [
            // { onSchedule: null },
            // { onSchedule: false },
            {
              createdAt: { ...monthly },
              OR: [{ onSchedule: null }, { onSchedule: false }],
            },
            {
              createdAt: { lt: monthly.gte },
              OR: [{ onSchedule: null }, { onSchedule: false }],
            },
          ],
          // AND: [{ onSchedule: { not: true } }],
          NOT: [{ state: 'DONE' }],
        },
      ],
    }
  }

  try {
    const workOrders = await prisma.workOrder.findMany({
      where,
      orderBy: { code: 'asc' },
      select: {
        code: true,
        activityType: true,
        daySchedule: true,
        state: true,
        activityName: true,
        priority: true,
        onSchedule: true,
        machine: { select: { name: true } },
        createdAt: true,
      },
    })
    if (strict === 'false') {
      return workOrders.map(({ daySchedule, createdAt, ...workOrder }) => {
        let onSchedule = workOrder.onSchedule
        if (onSchedule == null) {
          onSchedule =
            daySchedule != null ||
            (createdAt >= weekly.gte && createdAt <= weekly.lte)
        }
        return { ...workOrder, daySchedule, createdAt, onSchedule }
      })
    }
    return workOrders.map((workOrder) => ({ ...workOrder, onSchedule: true }))
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}

interface WorkOrderOnScheduleProps {
  id: number
  workOrderOnScheduleDto: WorkOrderOnScheduleDto
}
export async function workOrderOnSchedule({
  id,
  workOrderOnScheduleDto,
}: WorkOrderOnScheduleProps) {
  const { onSchedule } = workOrderOnScheduleDto
  const daySchedule = onSchedule ? null : workOrderOnScheduleDto.daySchedule

  try {
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { code: id },
      data: { onSchedule, daySchedule },
      select: {
        code: true,
        activityType: true,
        daySchedule: true,
        state: true,
        activityName: true,
        priority: true,
        onSchedule: true,
        machine: { select: { name: true } },
        createdAt: true,
      },
    })
    if (daySchedule != null) {
      return { ...updatedWorkOrder, onSchedule: true }
    }
    return updatedWorkOrder
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      throw new ServiceError({
        status: 400,
        message: `Los campos para actualizar la órden de trabajo #${id} son inválido`,
      })
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new ServiceError({
        status: 404,
        message: `La órden de trabajo #${id} no existe`,
      })
    }
    throw new ServiceError({ status: 500 })
  }
}
