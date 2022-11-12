import { z } from 'zod'
import { createZodDecimal } from '.'

const bootValues = ['DIRECT', 'SOFT']

const engineShapeUpdate = {
  function: z
    .string({ required_error: 'La función del motor es requerido' })
    .min(1, { message: 'La función del motor debe tener al menos 1 caracter' }),
  mark: z
    .string({ required_error: 'La marca del motor es requerido' })
    .min(1, { message: 'La marca del motor debe tener al menos 1 caracter' }),
  type: z
    .string({ required_error: 'El tipo del motor es requerido' })
    .min(1, { message: 'El tipo del motor debe tener al menos 1 caracter' }),
  powerHp: createZodDecimal({
    precision: 3,
    scale: 1,
    messageError:
      'La potencia [Hp] del motor debe tener precisión de 3 y escala de 1',
    required_error: 'La potencia [Hp] del motor es requerido',
  }),
  powerKw: createZodDecimal({
    precision: 3,
    scale: 1,
    messageError:
      'La potencia [Kw] del motor debe tener precisión de 3 y escala de 1',
    required_error: 'La potencia [Kw] del motor es requerido',
  }),
  voltage: z
    .string({
      required_error: 'La tensión [V] del motor es requerido',
    })
    .min(1, {
      message: 'La tensión [V] del motor debe tener al menos 1 caracter',
    }),
  current: z
    .string({ required_error: 'La corriente del motor es requerido' })
    .min(1, {
      message: 'La corriente del motor debe tener al menos 1 caracter',
    }),
  rpm: z
    .number({ required_error: 'Las rpm del motor es requerido' })
    .int({ message: 'Las rpm del motor debe ser número entero' }),
  cosPhi: createZodDecimal({
    precision: 4,
    scale: 2,
    messageError: 'El cos ϕ del motor debe tener precisión de 4 y escala de 2',
    required_error: 'El cos ϕ del motor es requerido',
  }),
  performance: createZodDecimal({
    precision: 4,
    scale: 2,
    messageError:
      'El rendimiento del motor debe tener precisión de 4 y escala de 2',
    required_error: 'El rendimiento del motor es requerido',
  }),
  frequency: z
    .number({
      required_error: 'La frecuencia del motor es requerido',
    })
    .int({ message: 'La frecuencia del motor debe ser número entero' }),
  poles: z
    .number({
      required_error: 'Los N° de polos del motor es requerido',
    })
    .int({ message: 'Los N° de polos del motor debe ser número entero' }),
  ip: z
    .number({
      required_error: 'El grado de protección del motor es requerido',
    })
    .int({
      message: 'El grado de protección del motor debe ser número entero',
    }),
  boot: z.enum(['DIRECT', 'SOFT'], {
    errorMap: () => {
      return {
        message: `El arranque del motor solo puede tener los valores: ${bootValues
          .map((t) => `'${t}'`)
          .join(' | ')}`,
      }
    },
  }),
}

const engineShapeCreate = {
  ...engineShapeUpdate,
  code: z
    .string({ required_error: 'El código del motor es requerido' })
    .length(20, {
      message: 'El código del motor debe tener 20 caracteres',
    }),
}

export const createEngineDto = z.object(engineShapeCreate)

export const updateEngineDto = z.object(engineShapeUpdate)
