import { Router } from 'express'
import {
  createEngine,
  getEngineByCode,
  getMachineEngines,
  updateEngineByCode,
} from '../controllers/engine.controllers'
import {
  createMachine,
  getAllMachines,
  getMachineByCode,
  updateMachine,
} from '../controllers/machine.controllers'
import { transformBody } from '../middlewares/machine.middlewares'
import { validateBody } from '../middlewares/validate'
import { createEngineDto, updateEngineDto } from '../schemas/engine'
import { createMachineDto, updateMachineDto } from '../schemas/machine'
import { mergeMaintenanceRequestRouter } from './maintenanceRequest.route'
import { mergeFailureReportRouter } from './failureReport.route'

export const machineRoute = '/machines'
export const engineRoute = (machineCode?: string) =>
  `/${machineCode ?? ':machineCode'}/engines`

const machineRouter = Router()

machineRouter.post(
  '/',
  transformBody,
  validateBody(createMachineDto),
  createMachine
)
machineRouter.get('/', getAllMachines)
machineRouter.get('/:code', getMachineByCode)
machineRouter.put(
  '/:code',
  transformBody,
  validateBody(updateMachineDto),
  updateMachine
)

machineRouter.get(engineRoute(), getMachineEngines)
machineRouter.get(`${engineRoute()}/:engineCode`, getEngineByCode)
machineRouter.post(engineRoute(), validateBody(createEngineDto), createEngine)
machineRouter.put(
  `${engineRoute()}/:engineCode`,
  validateBody(updateEngineDto),
  updateEngineByCode
)

mergeMaintenanceRequestRouter(machineRouter)
mergeFailureReportRouter(machineRouter)

export default machineRouter
