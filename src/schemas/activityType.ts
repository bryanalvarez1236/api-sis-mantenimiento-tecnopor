import { z } from 'zod'

const MIN_ACTIVITY_TYPE_ID = 1
const MAX_ACTIVITY_TYPE_ID = 6
const INVALID_RANGE_ERROR = `El id del tipo de actividad debe ser un número entre ${MIN_ACTIVITY_TYPE_ID} y ${MAX_ACTIVITY_TYPE_ID}`

export const ACTIVITY_TYPE_ID_ZOD = z
  .number({
    required_error: 'El id del tipo de actividad es requerido',
    invalid_type_error: 'El id del tipo de actividad debe ser un número',
  })
  .int('El id del tipo de actividad debe ser un número entero')
  .min(MIN_ACTIVITY_TYPE_ID, INVALID_RANGE_ERROR)
  .max(MAX_ACTIVITY_TYPE_ID, INVALID_RANGE_ERROR)
