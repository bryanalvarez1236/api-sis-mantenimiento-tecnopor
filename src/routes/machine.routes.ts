import { Router } from 'express'
import {
  createMachine,
  getMachineByCode,
  getMachines,
  updateMachine,
} from '../controllers/machine.controllers'
import { transformBody } from '../middlewares/machine.middlewares'
import { validateBody } from '../middlewares/validate'
import { CREATE_MACHINE_ZOD, UPDATE_MACHINE_ZOD } from '../schemas/machine'
import { mergeMaintenanceRequestRouter } from './maintenanceRequest.route'
import { mergeFailureReportRouter } from './failureReport.route'
import { mergeEngineRouter } from './engine.routes'
import { mergeHistoricalRouter } from './historical.route'

export const machineRoute = '/machines'
export const engineRoute = (machineCode?: string) =>
  `/${machineCode ?? ':machineCode'}/engines`

const machineRouter = Router()

machineRouter.get('/', getMachines)
machineRouter.get('/:code', getMachineByCode)
machineRouter.post(
  '/',
  transformBody,
  validateBody(CREATE_MACHINE_ZOD),
  createMachine
)
machineRouter.put(
  '/:code',
  transformBody,
  validateBody(UPDATE_MACHINE_ZOD),
  updateMachine
)

mergeEngineRouter(machineRouter)
mergeMaintenanceRequestRouter(machineRouter)
mergeFailureReportRouter(machineRouter)
mergeHistoricalRouter(machineRouter)

export default machineRouter
