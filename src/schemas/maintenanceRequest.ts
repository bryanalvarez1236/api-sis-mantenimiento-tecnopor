import { Machine, MaintenanceRequest } from '@prisma/client'
import { z } from 'zod'

const maintenanceRequestShapeCreate = {
  description: z
    .string({
      required_error:
        'La descripción de la solicitud de mantenimiento es requerido',
    })
    .min(
      10,
      'La descripción de la solicitud de mantenimiento debe tener al menos 10 caracteres'
    ),
}

export const createMaintenanceRequestDto = z.object(
  maintenanceRequestShapeCreate
)
export type CreateMaintenanceRequestDto = z.infer<
  typeof createMaintenanceRequestDto
>

export interface MaintenanceRequestResponseDto
  extends Pick<MaintenanceRequest, 'id' | 'description'> {
  machine: Pick<Machine, 'name'>
}
