import { z } from 'zod'
import { MACHINE_CODE_ZOD } from './machine'
import { transformFieldToUppercase } from '../libs/fields'
import { ACTIVITY_TYPE_ID_ZOD } from './activityType'
import { Activity } from '@prisma/client'

const activityShapeUpdate = {
  name: z
    .string({
      required_error: 'El nombre de la actividad es requerido',
      invalid_type_error: 'El nombre de la actividad debe ser un texto',
    })
    .transform((field) => transformFieldToUppercase({ field }) as string)
    .refine(
      (value) => value.length >= 16,
      'La función del motor debe tener al menos 16 caracteres'
    ),
  frequency: z
    .number({
      invalid_type_error: 'La frequencia de la actividad debe ser un número',
    })
    .int({ message: 'La frequencia de la actividad debe ser número entero' })
    .min(1, 'La frecuencia de la actividad debe ser mayor a 0'),
  activityTypeId: ACTIVITY_TYPE_ID_ZOD,
  pem: z
    .string({ invalid_type_error: 'El pem de la actividad debe ser un texto' })
    .regex(/^PEM [0-9]{3}/, {
      message:
        "El pem de la actividad debe tener el formato: PEM NNN (donde 'N' es número)",
    })
    .optional(),
}

const activityShapeCreate = {
  ...activityShapeUpdate,
  code: z
    .string({
      required_error: 'El código de la actividad es requerido',
      invalid_type_error: 'El código de la actividad debe ser un texto',
    })
    .regex(/^[A-Z]{3}[0-9]{2,3}$/, {
      message:
        "El código de la actividad debe tener el formato: LLLNN o LLLNNN (donde 'L' es letra mayúscula y 'N' es número)",
    }),
  machineCode: MACHINE_CODE_ZOD,
}

export const createActivityDto = z.object(activityShapeCreate)

export const updateActivityDto = z.object(activityShapeUpdate)

export type CreateActivityDto = z.infer<typeof createActivityDto>

export type UpdateActivityDto = z.infer<typeof updateActivityDto>

export interface ActivityResponseDto
  extends Omit<
    Activity,
    'machineCode' | 'deleted' | 'frequency' | 'activityTypeId'
  > {
  frequency?: string | number
  activityType: string
}
