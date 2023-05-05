import { Router } from 'express'
import { validateBody } from '../middlewares/validate'
import { createMaintenanceRequestDto } from '../schemas/maintenanceRequest'
import { createMaintenanceRequest } from '../controllers/maintenanceRequest.controllers'

export const MAINTENANCE_REQUEST_ROUTE = '/:machineCode/request'

export function mergeMaintenanceRequestRouter(machineRouter: Router) {
  machineRouter.post(
    MAINTENANCE_REQUEST_ROUTE,
    validateBody(createMaintenanceRequestDto),
    createMaintenanceRequest
  )
}
