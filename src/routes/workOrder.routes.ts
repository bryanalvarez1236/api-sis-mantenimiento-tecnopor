import { Router } from 'express'
import {
  createWorkOrder,
  getWorkOrderById,
  getWorkOrders,
  getWorkOrdersCount,
  updateWorkOrder,
} from '../controllers/workOrder.controllers'
import { validateBody } from '../middlewares/validate'
import { createWorkOrderDto, updateWorkOrderDto } from '../schemas/workOrder'

export const workOrderRoute = '/work-orders'

const workOrderRouter = Router()

workOrderRouter.get('/', getWorkOrders)
workOrderRouter.get('/count', getWorkOrdersCount)
workOrderRouter.get('/:id', getWorkOrderById)
workOrderRouter.post('/', validateBody(createWorkOrderDto), createWorkOrder)
workOrderRouter.put('/:id', validateBody(updateWorkOrderDto), updateWorkOrder)

export default workOrderRouter
