import { Router } from 'express'
import {
  createWorkOrder,
  deleteWorkOrderByCode,
  getWorkOrderByCode,
  getWorkOrders,
  getWorkOrdersCount,
  updateWorkOrder,
} from '../controllers/workOrder.controllers'
import { validateBody } from '../middlewares/validate'
import { validateUpdateWorkOrderDto } from '../middlewares/workOrder.middlewares'
import { createWorkOrderDto } from '../schemas/workOrder'

export const workOrderRoute = '/work-orders'

const workOrderRouter = Router()

workOrderRouter.get('/', getWorkOrders)
workOrderRouter.get('/count', getWorkOrdersCount)
workOrderRouter.get('/:code', getWorkOrderByCode)
workOrderRouter.post('/', validateBody(createWorkOrderDto), createWorkOrder)
workOrderRouter.put('/:id', validateUpdateWorkOrderDto, updateWorkOrder)
workOrderRouter.delete('/:id', deleteWorkOrderByCode)

export default workOrderRouter
