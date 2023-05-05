import { machineRoute } from '../../src/routes/machine.routes'
import { MAINTENANCE_REQUEST_ROUTE } from '../../src/routes/maintenanceRequest.route'
import {
  CreateMaintenanceRequestDto,
  MaintenanceRequestResponseDto,
} from '../../src/schemas/maintenanceRequest'
import { serverRoute } from '../helpers/api'
import { FIRST_MACHINE } from '../machine/helpers'

export const MAINTENANCE_REQUEST_ROUTES = {
  base: (machineCode: string) =>
    `${serverRoute}${machineRoute}${MAINTENANCE_REQUEST_ROUTE.replace(
      ':machineCode',
      machineCode
    )}`,
}

export const MACHINE_CODE = FIRST_MACHINE.code
export const CREATE_MAINTENANCE_REQUEST_DTO: CreateMaintenanceRequestDto = {
  description: 'Solicitud de mantenimiento',
}
export const CREATED_MAINTENANCE_REQUEST_RESPONSE_DTO: MaintenanceRequestResponseDto =
  {
    ...CREATE_MAINTENANCE_REQUEST_DTO,
    id: 1,
    machine: { name: FIRST_MACHINE.name },
    createdAt: new Date(),
  }
