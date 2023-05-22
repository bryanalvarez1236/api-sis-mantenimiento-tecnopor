import { RANGES, getBusinessDays, validateDate } from '../libs/date'
import prisma from '../libs/db'
import { ServiceError } from '.'

interface GetIndicatorsProps {
  date?: string
}
export async function getIndicators({ date }: GetIndicatorsProps) {
  const validDate = validateDate(date)
  const year = validDate.getFullYear()
  const month = validDate.getMonth()

  const monthly = RANGES['MONTHLY'](year, month)

  try {
    const workOrdersDb = await prisma.workOrder.findMany({
      where: {
        createdAt: { lte: monthly.lte },
        OR: [{ endDate: null }, { endDate: { gte: monthly.gte } }],
      },
      select: {
        code: true,
        state: true,
        totalHours: true,
        activityType: true,
        activityName: true,
        machineCode: true,
        endDate: true,
        machine: {
          select: {
            code: true,
            name: true,
            areaId: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    })

    const failureReports = await getFailureReports({
      gte: monthly.gte,
      lte: monthly.lte,
    })

    const workOrders = workOrdersDb.map(({ endDate, ...workOrder }) => ({
      ...workOrder,
      done: endDate
        ? endDate.getMonth() === validDate.getMonth() &&
          endDate.getFullYear() === validDate.getFullYear()
        : false,
    }))
    if (workOrders.length < 1) {
      return { workOrders }
    }

    const calendarMonth = await getCalendarMonth({ date: validDate })

    return {
      workOrders,
      failureReports,
      calendarMonth,
    }
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}

interface CalculateAvailabilityProps {
  date: Date
}
async function getCalendarMonth({ date }: CalculateAvailabilityProps) {
  const businessDays = getBusinessDays({
    year: date.getFullYear(),
    month: date.getMonth(),
  })
  const areas = await prisma.area.findMany()
  return areas.map(({ id, name, hours }) => ({
    id,
    name,
    time: businessDays * hours,
  }))
}

interface GetFailureReportsProps {
  gte: Date
  lte: Date
}
async function getFailureReports({ gte, lte }: GetFailureReportsProps) {
  const failureReports = await prisma.failureReport.findMany({
    where: { createdAt: { gte, lte } },
    select: {
      stopHours: true,
      machine: { select: { areaId: true } },
    },
  })
  const machines = failureReports.reduce<
    Record<string, { areaId: number; stopHours: number }>
  >((acc, value) => {
    const {
      stopHours,
      machine: { areaId },
    } = value
    const area = acc[areaId] ?? { areaId, stopHours: 0 }
    area.stopHours += stopHours
    return { ...acc, [areaId]: area }
  }, {})
  return Object.values(machines)
}
