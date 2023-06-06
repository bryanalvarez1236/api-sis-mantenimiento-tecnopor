import {
  Area,
  Engine,
  Machine,
  MachineImage,
  TechnicalDocumentation,
} from '@prisma/client'
import { z } from 'zod'

const technicalDocumentationValues = [
  'OPERATIONS_MANUAL',
  'MAINTENANCE_MANUAL',
  'ELECTRICAL_PLANS',
  'MECHANICAL_PLANS',
]

const criticalityValues = ['HIGH', 'MEDIUM', 'LOW']

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
    .min(5, {
      message: 'El nombre de la máquina debe tener al menos 5 caracteres',
    }),
  maker: z
    .string({
      invalid_type_error: 'El fabricante de la máquina debe ser un texto',
    })
    .min(1, {
      message: 'El fabricante de la máquina debe tener al menos 1 carácter',
    })
    .optional(),
  location: z
    .string({
      required_error: 'La ubicación de la máquina es requerida',
      invalid_type_error: 'La ubicación de la máquina debe ser un texto',
    })
    .min(3, {
      message: 'La ubicación de la máquina debe tener al menos 3 caracteres',
    })
    .max(11, {
      message: 'La ubicación de la máquina debe tener máximo 11 caracteres',
    }),
  areaId: z
    .number({
      required_error: 'El id del área de la máquina es requerido',
      invalid_type_error: 'El id del área de la máquina debe ser un número',
    })
    .min(1, 'El id del área de la máquina debe ser mínimo 1'),
  model: z
    .string({
      invalid_type_error: 'El modelo de la máquina debe ser un texto',
    })
    .min(1, {
      message: 'El modelo de la máquina debe tener al menos 1 caracter',
    })
    .optional(),
  specificData: z
    .string({
      invalid_type_error:
        'Los datos específicos de la máquina debe ser un texto',
    })
    .min(1, {
      message:
        'Los datos específicos de la máquina debe tener al menos 1 caracter',
    })
    .optional(),
  function: z
    .string({
      invalid_type_error: 'La función de la máquina debe ser un texto',
    })
    .min(1, {
      message: 'La función de la máquina debe tener al menos 1 caracter',
    })
    .optional(),
  technicalDocumentation: z
    .array(
      z.enum(
        [
          'OPERATIONS_MANUAL',
          'MAINTENANCE_MANUAL',
          'ELECTRICAL_PLANS',
          'MECHANICAL_PLANS',
        ],
        {
          errorMap: () => {
            return {
              message: `La documentación técnica de la máquina solo puede tener los valores: ${technicalDocumentationValues
                .map((t) => `'${t}'`)
                .join(' | ')}`,
            }
          },
        }
      )
    )
    .max(4, {
      message:
        'La documentación técnica de la máquina debe tener máximo 4 valores',
    }),
  criticality: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => {
      return {
        message: `La criticidad de la máquina solo puede tener los valores: ${criticalityValues
          .map((t) => `'${t}'`)
          .join(' | ')}`,
      }
    },
  }),
}

const MACHINE_SHAPE_CREATE = {
  code: MACHINE_CODE_ZOD,
  ...MACHINE_SHAPE_UPDATE,
}
export const CREATE_MACHINE_ZOD = z.object(MACHINE_SHAPE_CREATE)
export const UPDATE_MACHINE_ZOD = z.object(MACHINE_SHAPE_UPDATE)

interface ImageData {
  publicId: string
  url: string
}

export type CreateMachineDto = z.infer<typeof CREATE_MACHINE_ZOD>
export interface CreateMachineData extends CreateMachineDto {
  image?: { create: ImageData }
}

export type UpdateMachineDto = z.infer<typeof UPDATE_MACHINE_ZOD>
export interface UpdateMachineData extends UpdateMachineDto {
  image?: { create?: ImageData; update?: ImageData }
}

export interface MachineResponseDto
  extends Pick<Machine, 'code' | 'name' | 'location' | 'criticality'> {
  area: Pick<Area, 'name'>
  image: Pick<MachineImage, 'url'> | null
  maker?: string | null
  model?: string | null
  specificData?: string | null
  function?: string | null
  technicalDocumentation?: TechnicalDocumentation[]
  engines?: Engine[]
}
