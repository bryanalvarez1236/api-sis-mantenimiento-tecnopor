import { Router } from 'express'
import { validateBody } from '../middlewares/validate'
import { createMaintenanceRequestDto } from '../schemas/maintenanceRequest'
import {
  createMaintenanceRequest,
  getMaintenanceRequest,
} from '../controllers/maintenanceRequest.controllers'

export const MAINTENANCE_REQUEST_WITH_MACHINE_ROUTE = '/:machineCode/request'

export function mergeMaintenanceRequestRouter(machineRouter: Router) {
  machineRouter.post(
    MAINTENANCE_REQUEST_WITH_MACHINE_ROUTE,
    validateBody(createMaintenanceRequestDto),
    createMaintenanceRequest
  )
}

export const MAINTENANCE_REQUEST_ROUTE = '/maintenance-request'
const maintenanceRequestRouter = Router()

maintenanceRequestRouter.get('/', getMaintenanceRequest)

export default maintenanceRequestRouter
