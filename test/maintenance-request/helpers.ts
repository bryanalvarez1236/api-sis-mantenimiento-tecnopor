import { MaintenanceRequest } from '@prisma/client'
import { machineRoute } from '../../src/routes/machine.routes'
import {
  MAINTENANCE_REQUEST_ROUTE,
  MAINTENANCE_REQUEST_WITH_MACHINE_ROUTE,
} from '../../src/routes/maintenanceRequest.route'
import {
  CreateMaintenanceRequestDto,
  MaintenanceRequestResponseDto,
} from '../../src/schemas/maintenanceRequest'
import { serverRoute } from '../helpers/api'
import { FIRST_MACHINE } from '../machine/helpers'
import maintenanceRequestData from './maintenanceRequests.json'

export const maintenanceRequests: MaintenanceRequest[] =
  maintenanceRequestData as never as MaintenanceRequest[]

export const MAINTENANCE_REQUEST_ROUTES = {
  baseWithMachine: (machineCode: string) =>
    `${serverRoute}${machineRoute}${MAINTENANCE_REQUEST_WITH_MACHINE_ROUTE.replace(
      ':machineCode',
      machineCode
    )}`,
  base: `${serverRoute}${MAINTENANCE_REQUEST_ROUTE}`,
  baseWithId: (id: string) =>
    `${serverRoute}${MAINTENANCE_REQUEST_ROUTE}/${id}`,
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

export const ALL_MAINTENANCE_REQUESTS: MaintenanceRequestResponseDto[] =
  maintenanceRequests
    .filter(({ verified }) => !verified)
    .map(({ id, description, createdAt }) => ({
      id,
      description,
      createdAt,
      machine: { name: FIRST_MACHINE.name },
    }))
