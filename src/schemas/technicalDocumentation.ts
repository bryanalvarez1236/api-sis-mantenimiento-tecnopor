import { z } from 'zod'

const MIN_TECHNICAL_DOCUMENTATION_ID = 1
const MAX_TECHNICAL_DOCUMENTATION_ID = 4

const TECHNICAL_DOCUMENTATION_ID_ZOD = z
  .union([z.string(), z.number()], {
    errorMap: (_, { data }) => {
      if (data == null || data === '') {
        return {
          message:
            'El id de la documentación técnica de la máquina es requerido',
        }
      }
      return {
        message:
          'El id de la documentación técnica de la máquina debe ser un número',
      }
    },
  })
  .transform((value) => (value !== '' ? +value : NaN))
  .refine(
    (value) =>
      !isNaN(value) &&
      value >= MIN_TECHNICAL_DOCUMENTATION_ID &&
      value <= MAX_TECHNICAL_DOCUMENTATION_ID,
    (value) => ({
      message:
        value < MIN_TECHNICAL_DOCUMENTATION_ID ||
        value > MAX_TECHNICAL_DOCUMENTATION_ID
          ? `El id de la documentación técnica de la máquina debe ser un número entre ${MIN_TECHNICAL_DOCUMENTATION_ID} y ${MAX_TECHNICAL_DOCUMENTATION_ID}`
          : 'El id de la documentación técnica de la máquina debe ser un número',
    })
  )

export const TECHNICAL_DOCUMENTATION_ARRAY_ZOD = z
  .union(
    [TECHNICAL_DOCUMENTATION_ID_ZOD, TECHNICAL_DOCUMENTATION_ID_ZOD.array()],
    {
      errorMap: () => {
        return { message: 'La documentación técnica de la máquina es inválida' }
      },
    }
  )
  .optional()
  .transform((value) =>
    value == null
      ? []
      : typeof value === 'number'
      ? [value]
      : [...new Set(value)]
  )
