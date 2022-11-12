import { z } from 'zod'

const activityTypeValues = [
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
          message: `El tipo de actividad solo puede tener los valores: ${activityTypeValues
            .map((t) => `'${t}'`)
            .join(' | ')}`,
        }
      },
    }
  ),
  machineCode: z.string({
    required_error: 'El código de la máquina es requerido',
  }),
}

const activityShapeCreate = {
  ...activityShapeUpdate,
  code: z
    .string({ required_error: 'El código de la actividad es requerido' })
    .regex(/^[A-Z]{3}[0-9]{2}$/, {
      message:
        "El código de la actividad debe tener el formato: LLLNN (donde 'L' es letra mayúscula y 'N' es número)",
    }),
}

export const createActivityDto = z.object(activityShapeCreate)

export const updateActivityDto = z.object(activityShapeUpdate)
