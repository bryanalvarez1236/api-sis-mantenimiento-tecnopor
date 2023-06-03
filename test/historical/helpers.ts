import { HISTORICAL_WITH_MACHINE_ROUTE } from '../../src/routes/historical.route'
import { WORK_ORDER_ACTIVITY_TYPE_MAP } from '../../src/schemas/workOrder'
import { MACHINE_ROUTES } from '../machine/helpers'
import { workOrders } from '../work-order/helpers'

export const HISTORICAL_ROUTES = {
  baseWithMachineCode: (machineCode: string) =>
    `${MACHINE_ROUTES.base}${HISTORICAL_WITH_MACHINE_ROUTE}`.replace(
      ':machineCode',
      machineCode
    ),
  baseSummaryWithMachineCode: (machineCode: string) =>
    `${MACHINE_ROUTES.base}${HISTORICAL_WITH_MACHINE_ROUTE}/summary`.replace(
      ':machineCode',
      machineCode
    ),
}

export const DATE = new Date(2023, 7, 3)
const FROM_DATE = new Date(2021, 0)
export const MACHINE_CODE = 'CB-04-PRX-01'
export const MACHINE_NAME = 'PRE EXPANSORA'

const HISTORICAL_BY_DATE = workOrders
  .filter(({ machineCode, state, endDate }) => {
    if (machineCode !== MACHINE_CODE || state !== 'DONE' || endDate == null) {
      return false
    }
    const date = new Date(endDate)
    return date >= FROM_DATE && date <= DATE
  })
  .sort(
    ({ endDate: e1 }, { endDate: e2 }) =>
      new Date(e2 as Date).getTime() - new Date(e1 as Date).getTime()
  )

export const HISTORICAL = HISTORICAL_BY_DATE.map(
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
    Motor: engineFunction ?? null,
    'Causa de falla': failureCause ?? null,
    'Fecha inicio': new Date(startDate as Date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    'Fecha fin': new Date(endDate as Date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    'Total de horas': totalHours,
    Observaciones: observations,
  })
)

export const HISTORICAL_SUMMARY = HISTORICAL_BY_DATE.map(
  ({ code, activityName, activityDescription, endDate }) => ({
    code,
    activityName,
    activityDescription,
    endDate: new Date(endDate as Date).toISOString(),
  })
).slice(0, 10)
