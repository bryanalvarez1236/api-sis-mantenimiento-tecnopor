import { FailureReport, Machine } from '@prisma/client'
import { z } from 'zod'

const SYSTEM_FAILED_STATE_VALUES = [
  'ELECTRIC',
  'MECHANIC',
  'HYDRAULIC',
  'STEAM',
  'TIRE',
  'OTHER',
]

const failureReportShapeCreate = {
  systemFailedState: z.enum(
    ['ELECTRIC', 'MECHANIC', 'HYDRAULIC', 'STEAM', 'TIRE', 'OTHER'],
    {
      errorMap: () => {
        return {
          message: `El sistema en estado de falla solo puede tener los valores: ${SYSTEM_FAILED_STATE_VALUES.map(
            (t) => `'${t}'`
          ).join(' | ')}`,
        }
      },
    }
  ),
  description: z
    .string({
      required_error: 'La descripción del reporte de falla es requerido',
    })
    .min(
      10,
      'La descripción del reporte de falla debe tener al menos 10 caracteres'
    ),
  operatorName: z
    .string({
      required_error:
        'El nombre del operador del reporte de falla es requerido',
    })
    .min(
      4,
      'El nombre del operador del reporte de falla debe tener al menos 4 caracteres'
    ),
  stopHours: z
    .number({
      required_error: 'Las horas detinidas del reporte de falla es requerida',
    })
    .min(0, {
      message:
        'Las horas detenidas del reporte de falla debe ser un número positivo',
    }),
}

export const createFailureReportDto = z.object(failureReportShapeCreate)
export type CreateFailureReportDto = z.infer<typeof createFailureReportDto>

export interface FailureReportResponseDto
  extends Pick<
    FailureReport,
    | 'id'
    | 'systemFailedState'
    | 'description'
    | 'operatorName'
    | 'stopHours'
    | 'createdAt'
  > {
  image: { url: string } | null
  machine: Pick<Machine, 'name'>
}
