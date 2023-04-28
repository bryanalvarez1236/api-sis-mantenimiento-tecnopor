import type { Machine, Prisma, WorkOrder } from '@prisma/client'

export type WorkOrderWhereInput = Prisma.WorkOrderWhereInput

export interface ResponseWorkOrderGroupByMachineDto {
  totalHours: number
  groups: MachineGroupDto[]
}
export interface MachineGroupDto extends Pick<Machine, 'code' | 'name'> {
  hours: number
  workOrders: Pick<
    WorkOrder,
    'code' | 'state' | 'activityType' | 'totalHours' | 'activityName'
  >[]
}
