import { Router } from 'express'
import { validateBody } from '../middlewares/validate'
import { createStoreDto, updateStoreDto } from '../schemas/store'
import {
  addStore,
  deleteStoreById,
  getAllStores,
  getFieldsToCreate,
  updateStoreById,
} from '../controllers/store.controllers'

export const STORE_WITH_MACHINE_ROUTE = '/:machineCode/stores'

export function mergeStoreRouter(machineRouter: Router) {
  machineRouter.post(
    STORE_WITH_MACHINE_ROUTE,
    validateBody(createStoreDto),
    addStore
  )
}

export const STORE_ROUTE = '/stores'
const storeRouter = Router()

storeRouter.put('/:id', validateBody(updateStoreDto), updateStoreById)
storeRouter.get('/', getAllStores)
storeRouter.delete('/:id', deleteStoreById)
storeRouter.get('/fields/create', getFieldsToCreate)

export default storeRouter
