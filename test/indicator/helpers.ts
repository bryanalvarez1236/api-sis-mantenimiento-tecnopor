import { INDICATOR_ROUTE } from '../../src/routes/indicator.routes'
import { serverRoute } from '../helpers/api'
import { machines } from '../machine/helpers'
import { workOrders } from '../work-order/helpers'

export const DATE_CURRENT = new Date(2023, 3, 1)
export const LAST_DAY = new Date(2023, 4, 0, 23, 59, 59)

export const INDICATOR_ROUTES = {
  base: `${serverRoute}${INDICATOR_ROUTE}`,
  baseWithDate: (date: string) =>
    `${serverRoute}${INDICATOR_ROUTE}?date=${date}`,
}

export const ALL_WORK_ORDERS = ({
  gte,
  lte = LAST_DAY,
}: {
  gte: Date
  lte?: Date
}) =>
  workOrders
    .filter(
      ({ createdAt, endDate }) =>
        new Date(createdAt) <= lte &&
        (endDate == null || new Date(endDate) >= gte)
    )
    .sort(({ code: c1 }, { code: c2 }) => c1 - c2)
    .map(
      ({
        code,
        state,
        totalHours,
        activityType,
        activityName,
        machineCode,
        endDate,
      }) => {
        const machine = machines.find(({ code }) => code === machineCode)

        return {
          code,
          state: state ?? 'PLANNED',
          totalHours: totalHours ?? null,
          activityType,
          activityName,
          machineCode,
          machine: {
            name: machine?.name,
            areaId: machine?.areaId,
          },
          done: endDate
            ? endDate.getMonth() === gte.getMonth() &&
              endDate.getFullYear() === gte.getFullYear()
            : false,
        }
      }
    )
