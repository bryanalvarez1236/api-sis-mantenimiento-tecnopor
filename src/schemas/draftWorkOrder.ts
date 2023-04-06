import { DraftWorkOrder, WorkOrderPriority } from '@prisma/client'
import { z } from 'zod'
import { PRIORITY_VALUES } from './workOrder'

const workOrderFromDraftWorkOrderShapeCreate = {
  priority: z.enum(['URGENT', 'IMPORTANT', 'NORMAL'], {
    errorMap: () => {
      return {
        message: `La prioridad de la orden de trabajo solo puede tener los valores: ${PRIORITY_VALUES.map(
          (t) => `'${t}'`
        ).join(' | ')}`,
      }
    },
  }),
}

const createWorkOrderFromDraftWorkOrderDto = z.object(
  workOrderFromDraftWorkOrderShapeCreate
)

export type CreateWorkOrderFromDraftWorkOrderDto = z.infer<
  typeof createWorkOrderFromDraftWorkOrderDto
>

export interface DraftWorkOrderResponseDto extends DraftWorkOrder {
  machineName: string
  activityName: string
  priority: WorkOrderPriority
}
