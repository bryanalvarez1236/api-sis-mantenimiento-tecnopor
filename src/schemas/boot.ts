import { z } from 'zod'

const MIN_BOOT_ID = 1
const MAX_BOOT_ID = 2

export const BOOT_ID_ZOD = z
  .number({
    required_error: 'El id del arranque del motor es requerido',
    invalid_type_error: 'El id del arranque del motor debe ser un número',
  })
  .int('El id del arranque del motor debe ser un número entero')
  .min(
    MIN_BOOT_ID,
    'El id del arranque del motor debe ser un número entre 1 y 2'
  )
  .max(
    MAX_BOOT_ID,
    'El id del arranque del motor debe ser un número entre 1 y 2'
  )
