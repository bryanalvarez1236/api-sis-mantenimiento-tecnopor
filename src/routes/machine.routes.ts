import { Router } from 'express'
import {
  createMachine,
  getFieldsToCreateMachine,
  getFieldsToUpdateMachine,
  getMachineByCode,
  getMachines,
  updateMachine,
} from '../controllers/machine.controllers'
import { validateBodyWithFile } from '../middlewares/machine.middlewares'
import { CREATE_MACHINE_ZOD, UPDATE_MACHINE_ZOD } from '../schemas/machine'
import { mergeMaintenanceRequestRouter } from './maintenanceRequest.route'
import { mergeFailureReportRouter } from './failureReport.route'
import { mergeEngineRouter } from './engine.routes'
import { mergeHistoricalRouter } from './historical.route'
import { mergeStoreRouter } from './store.routes'

export const machineRoute = '/machines'

const machineRouter = Router()

machineRouter.get('/', getMachines)
machineRouter.get('/:code', getMachineByCode)
machineRouter.get('/fields/create', getFieldsToCreateMachine)
machineRouter.get('/:code/fields/update', getFieldsToUpdateMachine)

machineRouter.post(
  '/',
  validateBodyWithFile({ schema: CREATE_MACHINE_ZOD, fileName: 'image' }),
  createMachine
)

machineRouter.put(
  '/:code',
  validateBodyWithFile({ schema: UPDATE_MACHINE_ZOD, fileName: 'image' }),
  updateMachine
)

mergeEngineRouter(machineRouter)
mergeMaintenanceRequestRouter(machineRouter)
mergeFailureReportRouter(machineRouter)
mergeHistoricalRouter(machineRouter)
mergeStoreRouter(machineRouter)

export default machineRouter
