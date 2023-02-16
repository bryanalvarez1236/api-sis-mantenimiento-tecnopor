import { Router } from 'express'
import {
  createWorkOrder,
  getWorkOrderById,
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
workOrderRouter.get('/:id', getWorkOrderById)
workOrderRouter.post('/', validateBody(createWorkOrderDto), createWorkOrder)
workOrderRouter.put('/:id', validateUpdateWorkOrderDto, updateWorkOrder)

export default workOrderRouter
