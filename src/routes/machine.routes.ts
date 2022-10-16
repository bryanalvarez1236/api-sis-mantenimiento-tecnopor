import { Router } from 'express'
import {
  createMachine,
  getAllMachines,
  getMachineByCode,
  updateMachine,
} from '../controllers/machine.controllers'
import { transformBody } from '../middlewares/machine.middlewares'
import { validateBody } from '../middlewares/validate'
import { createMachineDTO, updateMachineDTO } from '../schemas/machines'

const machineRouter = Router()

machineRouter.post(
  '/create',
  transformBody,
  validateBody(createMachineDTO),
  createMachine
)
machineRouter.get('/', getAllMachines)
machineRouter.get('/:code', getMachineByCode)
machineRouter.put(
  '/:code',
  transformBody,
  validateBody(updateMachineDTO),
  updateMachine
)

export const machineRoute = '/machines'

export default machineRouter
