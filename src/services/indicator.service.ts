import { validateDate } from '../libs/date'
import { RANGES } from './workOrder.service'
import prisma from '../libs/db'
import { ServiceError } from '.'
import type {
  MachineGroupDto,
  ResponseWorkOrderGroupByMachineDto,
  WorkOrderWhereInput,
} from '../schemas/indicator'

interface GetIndicatorsProps {
  date?: string
  strict?: string
}
export async function getIndicators({ date, strict }: GetIndicatorsProps) {
  const validDate = validateDate(date)
  const year = validDate.getFullYear()
  const month = validDate.getMonth()

  const monthly = RANGES['MONTHLY'](year, month)

  let where: WorkOrderWhereInput = {
    daySchedule: { ...monthly },
  }
  if (strict === 'false') {
    where = {
      OR: [
        { ...where },
        { createdAt: { ...monthly } },
        { createdAt: { lte: monthly.gte }, state: { not: 'DONE' } },
        { updatedAt: { ...monthly }, state: 'DONE' },
      ],
    }
  }

  try {
    const workOrders = await prisma.workOrder.findMany({
      where,
      select: {
        code: true,
        state: true,
        totalHours: true,
        activityType: true,
        activityName: true,
        machineCode: true,
        machine: { select: { name: true } },
      },
    })

    const groupByMachine = workOrders.reduce<Record<string, MachineGroupDto>>(
      (acc, value) => {
        const {
          machineCode,
          machine: { name },
          totalHours,
          ...workOrder
        } = value
        const groupByMachine = acc[machineCode] || {
          code: machineCode,
          name,
          hours: 0,
          workOrders: [],
        }

        groupByMachine.hours += totalHours ?? 0
        const { workOrders } = groupByMachine
        groupByMachine.workOrders = [
          ...workOrders,
          { ...workOrder, totalHours: totalHours ?? undefined },
        ]
        acc[machineCode] = groupByMachine
        return acc
      },
      {}
    )
    const groups = Object.values(groupByMachine)
    const result: ResponseWorkOrderGroupByMachineDto = {
      totalHours: groups
        .map(({ hours }) => hours)
        .reduce<number>((acc, value) => acc + value, 0),
      groups: groups.sort((group1, group2) => group2.hours - group1.hours),
    }
    return result
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}
