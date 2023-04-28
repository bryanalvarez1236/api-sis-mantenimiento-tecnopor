import type { Machine, Prisma, WorkOrder } from '@prisma/client'

export type WorkOrderWhereInput = Prisma.WorkOrderWhereInput

export interface ResponseWorkOrderGroupByMachineDto {
  totalHours: number
  groups: MachineGroupDto[]
}
export interface MachineGroupDto extends Pick<Machine, 'code' | 'name'> {
  hours: number
  workOrders: WorkOrderGroupDto[]
}

interface WorkOrderGroupDto
  extends Pick<WorkOrder, 'code' | 'state' | 'activityType' | 'activityName'> {
  totalHours?: number | null
}
