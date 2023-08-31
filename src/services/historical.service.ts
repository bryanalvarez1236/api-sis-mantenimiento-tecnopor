import { ServiceError } from '.'
import { validateDate } from '../libs/date'
import prisma from '../libs/db'
import {
  WORK_ORDER_ACTIVITY_TYPE_MAP,
  WORK_ORDER_PROTECTION_EQUIPMENT_VALUES,
  WORK_ORDER_SECURITY_MEASURE_END_VALUES,
  WORK_ORDER_SECURITY_MEASURE_START_VALUES,
} from '../schemas/workOrder'
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
          activityType: true,
          activityName: true,
          activityDescription: true,
          createdAt: true,
          engineFunction: true,
          failureCause: true,
          securityMeasureStarts: true,
          protectionEquipments: true,
          startDate: true,
          endDate: true,
          securityMeasureEnds: true,
          stores: {
            select: { amount: true, store: { select: { name: true } } },
          },
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
        activityType,
        activityName,
        activityDescription,
        engineFunction,
        createdAt,
        failureCause,
        securityMeasureStarts,
        protectionEquipments,
        startDate,
        endDate,
        securityMeasureEnds,
        stores,
        totalHours,
        observations,
      }) => ({
        Nro: code,
        'Tipo de actividad':
          WORK_ORDER_ACTIVITY_TYPE_MAP[activityType] ?? activityType,
        'Nombre de actividad': activityName,
        'Descripción de actividad': activityDescription,
        Motor: engineFunction,
        'Fecha de creación': new Date(createdAt as Date).toLocaleDateString(
          'es-ES',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }
        ),
        'Causa de falla': failureCause,
        'Medidas de seguridad inicio del trabajo': securityMeasureStarts
          .map((sec) => WORK_ORDER_SECURITY_MEASURE_START_VALUES[sec])
          .join(', '),
        'Riesgos de trabajo (Precauciones a tener en cuenta)':
          protectionEquipments
            .map((pro) => WORK_ORDER_PROTECTION_EQUIPMENT_VALUES[pro])
            .join(', '),
        'Fecha inicio': new Date(startDate as Date).toLocaleDateString(
          'es-ES',
          { day: 'numeric', month: 'long', year: 'numeric' }
        ),
        'Hora inicio': new Date(startDate as Date).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        'Fecha fin': new Date(endDate as Date).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        'Hora fin': new Date(endDate as Date).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        'Medidas de seguridad fin del trabajo': securityMeasureEnds
          .map((sec) => WORK_ORDER_SECURITY_MEASURE_END_VALUES[sec])
          .join(', '),
        'Repuestos utilizados': stores
          .map(({ amount, store: { name } }) => `${amount} ${name}`)
          .join(', '),
        'Total de horas': totalHours,
        Observaciones: observations,
      })
    ),
  }
}
