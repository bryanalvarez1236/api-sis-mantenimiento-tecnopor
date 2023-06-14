import {
  Area,
  Criticality,
  Engine,
  Machine,
  MachineImage,
  TechnicalDocumentation,
} from '@prisma/client'
import { z } from 'zod'
import {
  transformFieldToUppercase,
  validateOptionalField,
} from '../libs/fields'
import { AREA_ID_ZOD } from './area'
import { CRITICALITY_ID_ZOD } from './criticality'
import { TECHNICAL_DOCUMENTATION_ARRAY_ZOD } from './technicalDocumentation'
import { generateImageZod } from './image'

export const MACHINE_CODE_ZOD = z
  .string({
    required_error: 'El código de la máquina es requerido',
    invalid_type_error: 'El código de la máquina de ser un texto',
  })
  .regex(/^[A-Z]{2}-[0-9]{2}-[A-Z]{3}-[0-9]{2}$/, {
    message:
      "El código de la máquina debe tener el formato: LL-NN-LLL-NN (donde 'L' es letra mayúscula y 'N' es número)",
  })

const MACHINE_SHAPE_UPDATE = {
  name: z
    .string({
      required_error: 'El nombre de la máquina es requerido',
      invalid_type_error: 'El nombre de la máquina debe ser un texto',
    })
    .transform((field) => transformFieldToUppercase({ field }) as string)
    .refine(
      (value) => value.length >= 5,
      'El nombre de la máquina debe tener al menos 5 caracteres'
    ),
  maker: z
    .string({
      invalid_type_error: 'El fabricante de la máquina debe ser un texto',
    })
    .optional()
    .transform((field) =>
      transformFieldToUppercase({ field, defaultValue: null })
    )
    .refine(
      (value) => validateOptionalField(value),
      "El fabricante de la máquina debe tener por lo menos 1 carácter o tener '-' para no definir el fabricante"
    ),
  location: z
    .string({
      required_error: 'La ubicación de la máquina es requerida',
      invalid_type_error: 'La ubicación de la máquina debe ser un texto',
    })
    .transform((field) => transformFieldToUppercase({ field }) as string)
    .refine(
      (value) => value.length >= 3,
      'La ubicación de la máquina debe tener al menos 3 caracteres'
    )
    .refine(
      (value) => value.length <= 11,
      'La ubicación de la máquina debe tener máximo 11 caracteres'
    ),
  areaId: AREA_ID_ZOD,
  model: z
    .string({
      invalid_type_error: 'El modelo de la máquina debe ser un texto',
    })
    .optional()
    .transform((field) =>
      transformFieldToUppercase({ field, defaultValue: null })
    )
    .refine(
      (value) => validateOptionalField(value),
      "El modelo de la máquina debe tener por lo menos 1 carácter o tener '-' para no definir el modelo"
    ),
  specificData: z
    .string({
      invalid_type_error:
        'Los datos específicos de la máquina debe ser un texto',
    })
    .optional()
    .transform((field) =>
      transformFieldToUppercase({ field, defaultValue: null })
    )
    .refine(
      (value) => validateOptionalField(value),
      "Los datos específicos de la máquina debe tener por lo menos 1 carácter o tener '-' para no definir los datos específicos"
    ),
  function: z
    .string({
      invalid_type_error: 'La función de la máquina debe ser un texto',
    })
    .optional()
    .transform((field) =>
      transformFieldToUppercase({ field, defaultValue: null })
    )
    .refine(
      (value) => validateOptionalField(value),
      "La función de la máquina debe tener por lo menos 1 carácter o tener '-' para no definir la función"
    ),
  technicalDocumentation: TECHNICAL_DOCUMENTATION_ARRAY_ZOD,
  criticalityId: CRITICALITY_ID_ZOD,
  image: generateImageZod({
    invalid_type_error:
      'La imagen de la máquina debe ser un solo archivo de tipo imagen',
  }),
}

const MACHINE_SHAPE_CREATE = {
  code: MACHINE_CODE_ZOD,
  ...MACHINE_SHAPE_UPDATE,
  image: generateImageZod({
    required_error: 'La imagen de la máquina es requerida',
    invalid_type_error:
      'La imagen de la máquina debe ser un solo archivo de tipo imagen',
  }),
}
export const CREATE_MACHINE_ZOD = z.object(MACHINE_SHAPE_CREATE)
export const UPDATE_MACHINE_ZOD = z.object(MACHINE_SHAPE_UPDATE)

interface ImageData {
  publicId: string
  url: string
}

export type CreateMachineDto = z.infer<typeof CREATE_MACHINE_ZOD>
export interface CreateMachineData extends Omit<CreateMachineDto, 'image'> {
  image: { create: ImageData }
}

export type UpdateMachineDto = z.infer<typeof UPDATE_MACHINE_ZOD>
export interface UpdateMachineData extends Omit<UpdateMachineDto, 'image'> {
  image?: { create?: ImageData; update?: ImageData }
}

export interface MachineResponseDto
  extends Pick<Machine, 'code' | 'name' | 'location'> {
  criticality: Pick<Criticality, 'name'>
  area: Pick<Area, 'name'>
  image: Pick<MachineImage, 'url'> | null
  maker?: string | null
  model?: string | null
  specificData?: string | null
  function?: string | null
  technicalDocumentation?: Pick<TechnicalDocumentation, 'name'>[]
  engines?: Engine[]
}
