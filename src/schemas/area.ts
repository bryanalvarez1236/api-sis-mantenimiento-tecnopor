import { z } from 'zod'

const MIN_AREA_ID = 1
const MAX_AREA_ID = 7

export const AREA_ID_ZOD = z
  .union([z.string(), z.number()], {
    errorMap: (_, { data }) => {
      if (data == null || data === '') {
        return {
          message: 'El id del área de la máquina es requerido',
        }
      }
      return {
        message: 'El id del área de la máquina debe ser un número',
      }
    },
  })
  .transform((value) => (value !== '' ? +value : NaN))
  .refine(
    (value) => !isNaN(value) && value >= MIN_AREA_ID && value <= MAX_AREA_ID,
    (value) => ({
      message:
        value < MIN_AREA_ID || value > MAX_AREA_ID
          ? `El id del área de la máquina debe ser un número entre ${MIN_AREA_ID} y ${MAX_AREA_ID}`
          : 'El id del área de la máquina debe ser un número',
    })
  )
