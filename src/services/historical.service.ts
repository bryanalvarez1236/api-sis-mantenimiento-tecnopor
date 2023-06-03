import { ServiceError } from '.'
import { validateDate } from '../libs/date'
import prisma from '../libs/db'
import { WORK_ORDER_ACTIVITY_TYPE_MAP } from '../schemas/workOrder'
import { machineNotFoundMessage } from './machine.service'

function getRangeFromTwoYearsAgo(date: string | Date) {
  const lte = validateDate(date)
  const twoAgo = lte.getFullYear() - 2
  const gte = new Date(twoAgo, 0)
  return { gte, lte }
}

interface GetHistoricalProps {
  machineCode: string
  date: string | Date
}
export async function getHistoricalSummary({
  machineCode,
  date,
}: GetHistoricalProps) {
  const { gte, lte } = getRangeFromTwoYearsAgo(date)
  const machine = await prisma.machine.findUnique({
    where: { code: machineCode },
    select: {
      workOrder: {
        where: { state: 'DONE', endDate: { gte, lte } },
        orderBy: { endDate: 'desc' },
        take: 10,
        select: {
          code: true,
          activityName: true,
          activityDescription: true,
          endDate: true,
        },
      },
    },
  })

  if (machine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(machineCode),
    })
  }

  return machine.workOrder
}

export async function getHistorical({ machineCode, date }: GetHistoricalProps) {
  const { gte, lte } = getRangeFromTwoYearsAgo(date)
  const machine = await prisma.machine.findUnique({
    where: { code: machineCode },
    select: {
      code: true,
      name: true,
      workOrder: {
        where: { state: 'DONE', endDate: { gte, lte } },
        orderBy: { endDate: 'desc' },
        select: {
          code: true,
          activityName: true,
          activityDescription: true,
          activityType: true,
          engineFunction: true,
          failureCause: true,
          startDate: true,
          endDate: true,
          totalHours: true,
          observations: true,
        },
      },
    },
  })

  if (machine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(machineCode),
    })
  }

  const { code, name, workOrder } = machine

  return {
    code,
    name,
    workOrders: workOrder.map(
      ({
        code,
        activityName,
        activityDescription,
        activityType,
        engineFunction,
        failureCause,
        startDate,
        endDate,
        totalHours,
        observations,
      }) => ({
        Nro: code,
        'Nombre de actividad': activityName,
        'Descripción de actividad': activityDescription,
        'Tipo de actividad':
          WORK_ORDER_ACTIVITY_TYPE_MAP[activityType] ?? activityType,
        Motor: engineFunction,
        'Causa de falla': failureCause,
        'Fecha inicio': new Date(startDate as Date).toLocaleDateString(
          'es-ES',
          { day: 'numeric', month: 'long', year: 'numeric' }
        ),
        'Fecha fin': new Date(endDate as Date).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        'Total de horas': totalHours,
        Observaciones: observations,
      })
    ),
  }
}
