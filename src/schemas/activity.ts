import { State } from '@prisma/client'
import { z } from 'zod'

export const ACTIVITY_TYPE_VALUES = [
  'CONDITION_CHECK',
  'VISUAL_INSPECTIONS',
  'LUBRICATION',
  'AUTONOMOUS_MAINTENANCE',
  'PERIODIC_MAINTENANCE',
  'CORRECTIVE_MAINTENANCE',
]

const activityShapeUpdate = {
  name: z
    .string({ required_error: 'El nombre de la actividad es requerido' })
    .min(1, {
      message: 'El nombre de la actividad debe tener al menos un caracter',
    }),
  frequency: z
    .number({ required_error: 'La frequencia de la actividad es requerida' })
    .int({ message: 'La frequencia de la actividad debe ser número entero' }),
  activityType: z.enum(
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
  ),
}

const activityShapeCreate = {
  ...activityShapeUpdate,
  code: z
    .string({ required_error: 'El código de la actividad es requerido' })
    .regex(/^[A-Z]{3}[0-9]{2,3}$/, {
      message:
        "El código de la actividad debe tener el formato: LLLNN o LLLNNN (donde 'L' es letra mayúscula y 'N' es número)",
    }),
  machineCode: z.string({
    required_error: 'El código de la máquina es requerido',
  }),
  pem: z
    .string()
    .regex(/^PEM [0-9]{3}/, {
      message:
        "El pem de la actividad debe tener el formato: PEM NNN (donde 'N' es número)",
    })
    .optional(),
}

export const createActivityDto = z.object(activityShapeCreate)

export const updateActivityDto = z.object(activityShapeUpdate)

export type CreateActivityDto = z.infer<typeof createActivityDto> & {
  state?: State
}

export type UpdateActivityDto = z.infer<typeof updateActivityDto>
