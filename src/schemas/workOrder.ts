import {
  Activity,
  Engine,
  Machine,
  MachineArea,
  WorkOrder,
  WorkOrderState,
} from '@prisma/client'
import { z } from 'zod'

const ACTIVITY_TYPE_VALUES = [
  'PLANNED_PREVENTIVE',
  'CORRECTIVE',
  'INSPECTION',
  'CONDITION_CHECK',
  'ROUTINE',
]
export const PRIORITY_VALUES = ['URGENT', 'IMPORTANT', 'NORMAL']
const SECURITY_MEASURE_START_VALUES = ['BLOCKED', 'LABELED', 'BLOCKED_LABELED']
const PROTECTION_EQUIPMENT_VALUES = [
  'HELMET',
  'SECURITY_GLASSES',
  'GLOVES',
  'SECURITY_HARNESS',
  'ACOUSTIC_PROTECTORS',
  'SECURITY_BOOTS',
  'OTHERS',
]
const SECURITY_MEASURE_END_VALUES = ['RETIRE', 'REPORT', 'KEEP', 'CHECK']
const STATE_VALUES = ['PLANNED', 'VALIDATED', 'DOING', 'DONE']

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
  activityType: z.enum(
    [
      'PLANNED_PREVENTIVE',
      'CORRECTIVE',
      'INSPECTION',
      'CONDITION_CHECK',
      'ROUTINE',
    ],
    {
      errorMap: () => {
        return {
          message: `El tipo de actividad de la orden de trabajo solo puede tener los valores: ${ACTIVITY_TYPE_VALUES.map(
            (t) => `'${t}'`
          ).join(' | ')}`,
        }
      },
    }
  ),
  priority: z.enum(['URGENT', 'IMPORTANT', 'NORMAL'], {
    errorMap: () => {
      return {
        message: `La prioridad de la orden de trabajo solo puede tener los valores: ${PRIORITY_VALUES.map(
          (t) => `'${t}'`
        ).join(' | ')}`,
      }
    },
  }),
  machineCode: z
    .string({ required_error: 'El código de la máquina es requerido' })
    .regex(/^[A-Z]{2}-[0-9]{2}-[A-Z]{3}-[0-9]{2}$/, {
      message:
        "El código de la máquina debe tener el formato: LL-NN-LLL-NN (donde 'L' es letra mayúscula y 'N' es número)",
    }),
  engineCode: z
    .string()
    .regex(/^[A-Z]{2}-[0-9]{2}-[A-Z]{3}-[0-9]{2}-MOT-[0-9]{3}$/, {
      message:
        "El código de motor de la orden de trabajo debe tener el formato: LL-NN-LLL-NN-MOT-NNN (donde 'L' es letra mayúscula y 'N' es número)",
    })
    .optional(),
  engineFunction: z
    .string({ required_error: 'La función del motor es requerido' })
    .min(1, { message: 'La función del motor debe tener al menos 1 caracter' })
    .optional(),
  activityCode: z
    .string()
    .regex(/^[A-Z]{3}[0-9]{2,3}$/, {
      message:
        "El código de actividad de la orden de trabajo debe tener el formato: LLLNN o LLLNNN (donde 'L' es letra mayúscula y 'N' es número)",
    })
    .optional(),
  activityName: z
    .string({
      required_error:
        'El nombre de actividad de la orden de trabajo es requerido',
    })
    .min(1, {
      message: 'El nombre de actividad debe tener al menos un caracter',
    })
    .optional(),
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

const workOrderShapeUpdateToDoing = {
  securityMeasureStarts: z
    .array(
      z.enum(['BLOCKED', 'LABELED', 'BLOCKED_LABELED'], {
        errorMap: () => {
          return {
            message: `Las medidas de seguridad inicio de trabajo de la orden de trabajo solo puede tener los valores: ${SECURITY_MEASURE_START_VALUES.map(
              (t) => `'${t}'`
            ).join(' | ')}`,
          }
        },
      })
    )
    .max(3, {
      message:
        'Las medidas de seguridad inicio de trabajo de la orden de trabajo debe tener máximo 3 valores',
    }),
  protectionEquipments: z
    .array(
      z.enum(
        [
          'HELMET',
          'SECURITY_GLASSES',
          'GLOVES',
          'SECURITY_HARNESS',
          'ACOUSTIC_PROTECTORS',
          'SECURITY_BOOTS',
          'OTHERS',
        ],
        {
          errorMap: () => {
            return {
              message: `Los riesgos de trabajo de la orden de trabajo solo puede tener los valores: ${PROTECTION_EQUIPMENT_VALUES.map(
                (t) => `'${t}'`
              ).join(' | ')}`,
            }
          },
        }
      )
    )
    .max(7, {
      message:
        'Los riesgos de trabajo de la orden de trabajo debe tener máximo 7 valores',
    }),
  startDate: dateSchema,
}
export const updateWorkOrderToDoingDto = z.object(workOrderShapeUpdateToDoing)
const checkListVerifiedShape = {
  field: z.string({
    required_error: 'El campo del check list a validar es requerido',
  }),
  options: z
    .array(
      z.string().min(1, {
        message: 'La opción del check list debe tener al menos 1 caracter',
      })
    )
    .optional(),
  value: z
    .string()
    .min(1, {
      message: 'El valor del check list debe tener al menos 1 caracter',
    })
    .optional(),
}
export const checkListVerified = z.object({
  checkListVerified: z.array(z.object(checkListVerifiedShape)),
})
const workOrderShapeUpdateToDone = {
  activityDescription: z.string({
    required_error:
      'La descripción de la actividad de la orden de trabajo es requerida',
  }),
  storeDescription: z.string({
    required_error:
      'La descripción de los repuestos de la orden de trabajo es requerida',
  }),
  storeUnit: z.number({
    required_error:
      'La unidad de los repuestos de la orden de trabajo es requerida',
  }),
  failureCause: z.string().optional(),
  endDate: dateSchema,
  securityMeasureEnds: z
    .array(
      z.enum(['RETIRE', 'REPORT', 'KEEP', 'CHECK'], {
        errorMap: () => {
          return {
            message: `Las medidas de seguridad fin de trabajo de la orden de trabajo solo puede tener los valores: ${SECURITY_MEASURE_END_VALUES.map(
              (t) => `'${t}'`
            ).join(' | ')}`,
          }
        },
      })
    )
    .max(4, {
      message:
        'Las medidas de seguridad fin de trabajo de la orden de trabajo debe tener máximo 4 valores',
    }),
  totalHours: z.number(),
  observations: z
    .string()
    .min(3, {
      message:
        'Las observaciones de la orden de trabajo debe tener al menos 3 caracteres',
    })
    .optional(),
}
export const updateWorkOrderToDoneDto = z.object(workOrderShapeUpdateToDone)
const workOrderShapeUpdateGeneral = {
  securityMeasureStarts: z
    .array(
      z.enum(['BLOCKED', 'LABELED', 'BLOCKED_LABELED'], {
        errorMap: () => {
          return {
            message: `Las medidas de seguridad inicio de trabajo de la orden de trabajo solo puede tener los valores: ${SECURITY_MEASURE_START_VALUES.map(
              (t) => `'${t}'`
            ).join(' | ')}`,
          }
        },
      })
    )
    .max(3, {
      message:
        'Las medidas de seguridad inicio de trabajo de la orden de trabajo debe tener máximo 3 valores',
    })
    .optional(),
  protectionEquipments: z
    .array(
      z.enum(
        [
          'HELMET',
          'SECURITY_GLASSES',
          'GLOVES',
          'SECURITY_HARNESS',
          'ACOUSTIC_PROTECTORS',
          'SECURITY_BOOTS',
          'OTHERS',
        ],
        {
          errorMap: () => {
            return {
              message: `Los riesgos de trabajo de la orden de trabajo solo puede tener los valores: ${PROTECTION_EQUIPMENT_VALUES.map(
                (t) => `'${t}'`
              ).join(' | ')}`,
            }
          },
        }
      )
    )
    .max(7, {
      message:
        'Los riesgos de trabajo de la orden de trabajo debe tener máximo 7 valores',
    })
    .optional(),
  activityDescription: z.string().optional().nullable(),
  storeDescription: z.string().optional().nullable(),
  storeUnit: z.number().optional().nullable(),
  failureCause: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  totalHours: z.number().optional().nullable(),
  securityMeasureEnds: z
    .array(
      z.enum(['RETIRE', 'REPORT', 'KEEP', 'CHECK'], {
        errorMap: () => {
          return {
            message: `Las medidas de seguridad fin de trabajo de la orden de trabajo solo puede tener los valores: ${SECURITY_MEASURE_END_VALUES.map(
              (t) => `'${t}'`
            ).join(' | ')}`,
          }
        },
      })
    )
    .max(4, {
      message:
        'Las medidas de seguridad fin de trabajo de la orden de trabajo debe tener máximo 4 valores',
    })
    .optional(),
  state: z.enum(['PLANNED', 'VALIDATED', 'DOING', 'DONE'], {
    errorMap: () => {
      return {
        message: `El estado de la orden de trabajo solo puede tener los valores: ${STATE_VALUES.map(
          (t) => `'${t}'`
        ).join(' | ')}`,
      }
    },
  }),
  observations: z
    .string()
    .min(3, {
      message:
        'Las observaciones de la orden de trabajo debe tener al menos 3 caracteres',
    })
    .optional()
    .nullable(),
  checkListVerified: z.array(z.object(checkListVerifiedShape)).optional(),
}
export const updateWorkOrderGeneralDto = z.object(workOrderShapeUpdateGeneral)
export type UpdateWorkOrderGeneralDto = z.infer<
  typeof updateWorkOrderGeneralDto
>

export const createWorkOrderDto = z.object(workOrderShapeCreate)
export type CreateWorkOrderDto = z.infer<typeof createWorkOrderDto>

export const updateWorkOrderDto = z.object(workOrderShapeUpdate)
export type UpdateWorkOrderDto = z.infer<typeof updateWorkOrderDto>

export interface WorkOrderResponseDto
  extends Omit<WorkOrder, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> {
  startDate?: string
  endDate?: string
  machineCode: string
  machineName: string
  machineArea: MachineArea
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
