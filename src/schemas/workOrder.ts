import {
  Activity,
  Engine,
  Machine,
  WorkOrder,
  WorkOrderState,
} from '@prisma/client'
import { z } from 'zod'
import { ACTIVITY_TYPE_VALUES } from './activity'

const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
  return arg
}, z.date())

const WORK_ORDER_STATE_VALUES = ['PLANNED', 'VALIDATED', 'DOING', 'DONE']
export const WORK_ORDER_CHANGE_STATE = {
  PLANNED: { nextState: 'VALIDATED', previousState: undefined },
  VALIDATED: { nextState: 'DOING', previousState: 'PLANNED' },
  DOING: { nextState: 'DONE', previousState: 'VALIDATED' },
  DONE: { nextState: undefined, previousState: 'DOING' },
}

export function validateWorkOrderState(
  currentState: WorkOrderState,
  stateUpdate: string
) {
  if (currentState === stateUpdate) {
    return stateUpdate
  }
  const validState =
    WORK_ORDER_CHANGE_STATE[
      currentState as keyof typeof WORK_ORDER_CHANGE_STATE
    ]
  const { nextState, previousState } = validState as {
    nextState?: string
    previousState?: string
  }
  return stateUpdate === previousState || stateUpdate === nextState
}

const workOrderShapeCreate = {
  engineCode: z
    .string({ required_error: 'El código del motor es requerido' })
    .regex(/^[A-Z]{2}-[0-9]{2}-[A-Z]{3}-[0-9]{2}-MOT-[0-9]{3}$/, {
      message:
        "El código de motor de la orden de trabajo debe tener el formato: LL-NN-LLL-NN-MOT-NNN (donde 'L' es letra mayúscula y 'N' es número)",
    }),
  activity: z.object({
    code: z
      .string()
      .regex(/^[A-Z]{3}[0-9]{2,3}$/, {
        message:
          "El código de actividad de la orden de trabajo debe tener el formato: LLLNN o LLLNNN (donde 'L' es letra mayúscula y 'N' es número)",
      })
      .optional(),
    name: z
      .string({
        required_error:
          'El nombre de actividad de la orden de trabajo es requerido',
      })
      .min(1, {
        message: 'El nombre de actividad debe tener al menos un caracter',
      })
      .optional(),
    activityType: z
      .enum(
        [
          'CONDITION_CHECK',
          'VISUAL_INSPECTIONS',
          'LUBRICATION',
          'AUTONOMOUS_MAINTENANCE',
          'PERIODIC_MAINTENANCE',
          'CORRECTIVE_MAINTENANCE',
        ],
        {
          errorMap: () => {
            return {
              message: `El tipo de actividad solo puede tener los valores: ${ACTIVITY_TYPE_VALUES.map(
                (t) => `'${t}'`
              ).join(' | ')}`,
            }
          },
        }
      )
      .optional(),
  }),
}

const workOrderShapeUpdate = {
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  state: z.enum(['PLANNED', 'VALIDATED', 'DOING', 'DONE'], {
    errorMap: () => {
      return {
        message: `El estado de la orden de trabajo solo puede tener los valores: ${WORK_ORDER_STATE_VALUES.map(
          (t) => `'${t}'`
        ).join(' | ')}`,
      }
    },
  }),
  failureCause: z
    .string()
    .min(1, {
      message:
        'La causa de falla de la orden de trabajo debe tener al menos 1 caracter',
    })
    .optional(),
}

export const createWorkOrderDto = z.object(workOrderShapeCreate)
export type CreateWorkOrderDto = z.infer<typeof createWorkOrderDto>

export const updateWorkOrderDto = z.object(workOrderShapeUpdate)
export type UpdateWorkOrderDto = z.infer<typeof updateWorkOrderDto>

export interface WorkOrderResponseDto
  extends Omit<
    WorkOrder,
    'startDate' | 'endDate' | 'failureCause' | 'createdAt' | 'updatedAt'
  > {
  startDate?: string
  endDate?: string
  failureCause?: string
  machine: Pick<Machine, 'code' | 'area' | 'name'>
  activity: Pick<Activity, 'name' | 'activityType'>
  engine: Pick<Engine, 'function'>
  createdAt: string
  updatedAt: string
}

export interface WorkOrderResponseDb
  extends Omit<
    WorkOrder,
    'startDate' | 'endDate' | 'failureCause' | 'createdAt' | 'updatedAt'
  > {
  startDate?: string
  endDate?: string
  failureCause?: string
  activity: Pick<Activity, 'name' | 'activityType'>
  engine: Pick<Engine, 'function'> & {
    machine: Pick<Machine, 'code' | 'area' | 'name'>
  }
}
