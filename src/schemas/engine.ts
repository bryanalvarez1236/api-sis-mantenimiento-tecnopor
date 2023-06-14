import { z } from 'zod'
import { createZodDecimal } from '.'
import {
  transformFieldToUppercase,
  validateOptionalField,
} from '../libs/fields'
import { BOOT_ID_ZOD } from './boot'
import { Engine } from '@prisma/client'

const engineShapeUpdate = {
  function: z
    .string({
      required_error: 'La función del motor es requerido',
      invalid_type_error: 'La función del motor debe ser un texto',
    })
    .transform((field) => transformFieldToUppercase({ field }) as string)
    .refine(
      (value) => value.length >= 6,
      'La función del motor debe tener al menos 6 caracteres'
    ),
  mark: z
    .string({ invalid_type_error: 'La marca del motor debe ser un texto' })
    .optional()
    .transform((field) =>
      transformFieldToUppercase({ field, defaultValue: null })
    )
    .refine(
      (value) => validateOptionalField(value),
      "La marca del motor debe tener por lo menos 1 carácter o tener '-' para no definir la marca"
    ),
  type: z
    .string({ invalid_type_error: 'El tipo del motor debe ser un texto' })
    .optional()
    .transform((field) =>
      transformFieldToUppercase({ field, defaultValue: null })
    )
    .refine(
      (value) => validateOptionalField(value),
      "El tipo del motor debe tener por lo menos 1 carácter o tener '-' para no definir el tipo"
    ),
  powerHp: createZodDecimal({
    precision: 4,
    scale: 2,
    messageError:
      'La potencia [Hp] del motor debe tener precisión de 4 y escala de 2',
    required_error: 'La potencia [Hp] del motor es requerido',
    invalid_type_error: 'La potencia [Hp] del motor debe ser un número',
  }).refine(
    (value) => value >= 0,
    'La potencia [Hp] del motor debe ser un número positivo'
  ),
  powerKw: createZodDecimal({
    precision: 4,
    scale: 2,
    messageError:
      'La potencia [Kw] del motor debe tener precisión de 4 y escala de 2',
    required_error: 'La potencia [Kw] del motor es requerido',
    invalid_type_error: 'La potencia [Kw] del motor debe ser un número',
  }).refine(
    (value) => value >= 0,
    'La potencia [Kw] del motor debe ser un número positivo'
  ),
  voltage: z
    .string({
      required_error: 'La tensión [V] del motor es requerido',
      invalid_type_error: 'La tensión [V] del motor debe ser un texto',
    })
    .transform((field) => transformFieldToUppercase({ field }) as string)
    .refine(
      (value) => value.length >= 3,
      'La tensión [V] del motor debe tener al menos 3 caracteres'
    ),
  current: z
    .string({
      required_error: 'La corriente del motor es requerido',
      invalid_type_error: 'La corriente del motor debe ser un texto',
    })
    .transform((field) => transformFieldToUppercase({ field }) as string)
    .refine(
      (value) => value.length >= 1,
      'La corriente del motor debe tener al menos 1 carácter'
    ),
  rpm: z
    .number({
      required_error: 'Las rpm del motor es requerido',
      invalid_type_error: 'Las rpm del motor debe ser número',
    })
    .int({ message: 'Las rpm del motor debe ser número entero' })
    .min(0, 'Las rpm del motor debe ser número entero positivo'),
  cosPhi: createZodDecimal({
    precision: 4,
    scale: 3,
    messageError: 'El cos ϕ del motor debe tener precisión de 4 y escala de 3',
    required_error: 'El cos ϕ del motor es requerido',
    invalid_type_error: 'El cos ϕ del motor debe ser un número',
  }).refine(
    (value) => value >= 0,
    'El cos ϕ del motor debe ser un número positivo'
  ),
  performance: createZodDecimal({
    precision: 4,
    scale: 3,
    messageError:
      'El rendimiento del motor debe tener precisión de 4 y escala de 3',
    required_error: 'El rendimiento del motor es requerido',
    invalid_type_error: 'El rendimiento del motor debe ser un número',
  }).refine(
    (value) => value >= 0,
    'El rendimiento del motor debe ser un número positivo'
  ),
  frequency: z
    .number({
      required_error: 'La frecuencia del motor es requerido',
      invalid_type_error: 'La frecuencia del motor debe ser número',
    })
    .int({ message: 'La frecuencia del motor debe ser número entero' })
    .min(0, 'La frecuencia del motor debe ser número entero positivo'),
  poles: z
    .number({
      required_error: 'Los N° de polos del motor es requerido',
      invalid_type_error: 'Los N° de polos del motor debe ser número',
    })
    .int({ message: 'Los N° de polos del motor debe ser número entero' })
    .min(0, 'Los N° de polos del motor debe ser número entero positivo'),
  ip: z
    .number({
      required_error: 'El grado de protección del motor es requerido',
      invalid_type_error: 'El grado de protección del motor debe ser número',
    })
    .int({
      message: 'El grado de protección del motor debe ser número entero',
    })
    .min(0, 'El grado de protección del motor debe ser número entero positivo'),
  bootId: BOOT_ID_ZOD,
}

const engineShapeCreate = {
  ...engineShapeUpdate,
  code: z
    .string({
      required_error: 'El código del motor es requerido',
      invalid_type_error: 'El código del motor debe ser un texto',
    })
    .regex(/^[A-Z]{2}-[0-9]{2}-[A-Z]{3}-[0-9]{2}-MOT-[0-9]{3}$/, {
      message:
        "El código del motor debe tener el formato: LL-NN-LLL-NN-MOT-NNN (donde 'L' es letra mayúscula y 'N' es número)",
    }),
}

export const createEngineDto = z.object(engineShapeCreate)

export const updateEngineDto = z.object(engineShapeUpdate)

export type CreateEngineDto = z.infer<typeof createEngineDto>

export type UpdateEngineDto = z.infer<typeof updateEngineDto>

export interface EngineResponseDto
  extends Omit<Engine, 'bootId' | 'machineCode'> {
  boot: string
}
