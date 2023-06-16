import { Router } from 'express'
import {
  addEngine,
  getEngineByCode,
  getFieldsToCreateEngine,
  getFieldsToUpdateEngine,
  getMachineEngines,
  updateEngineByCode,
} from '../controllers/engine.controllers'
import { validateBody } from '../middlewares/validate'
import { createEngineDto, updateEngineDto } from '../schemas/engine'

export const ENGINE_WITH_MACHINE_ROUTE = '/:machineCode/engines'

export function mergeEngineRouter(machineRouter: Router) {
  machineRouter.get(ENGINE_WITH_MACHINE_ROUTE, getMachineEngines)
  machineRouter.post(
    ENGINE_WITH_MACHINE_ROUTE,
    validateBody(createEngineDto),
    addEngine
  )
}

export const ENGINE_ROUTE = '/engines'
const engineRouter = Router()

engineRouter.get('/:code', getEngineByCode)
engineRouter.put('/:code', validateBody(updateEngineDto), updateEngineByCode)
engineRouter.post('/fields/create', getFieldsToCreateEngine)
engineRouter.put('/:code/fields/update', getFieldsToUpdateEngine)

export default engineRouter
