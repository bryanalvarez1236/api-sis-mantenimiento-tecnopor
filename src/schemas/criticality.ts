import { z } from 'zod'

const MIN_CRITICALITY_ID = 1
const MAX_CRITICALITY_ID = 7

export const CRITICALITY_ID_ZOD = z
  .union([z.string(), z.number()], {
    errorMap: (_, { data }) => {
      if (data == null || data === '') {
        return {
          message: 'El id de la criticidad de la máquina es requerido',
        }
      }
      return {
        message: 'El id de la criticidad de la máquina debe ser un número',
      }
    },
  })
  .transform((value) => (value !== '' ? +value : NaN))
  .refine(
    (value) =>
      !isNaN(value) &&
      value >= MIN_CRITICALITY_ID &&
      value <= MAX_CRITICALITY_ID,
    (value) => ({
      message:
        value < MIN_CRITICALITY_ID || value > MAX_CRITICALITY_ID
          ? `El id de la criticidad de la máquina debe ser un número entre ${MIN_CRITICALITY_ID} y ${MAX_CRITICALITY_ID}`
          : 'El id de la criticidad de la máquina debe ser un número',
    })
  )
