import { Router } from 'express'
import {
  createWorkOrderFromDraftWorkOrder,
  deleteDraftWorkOrderByCode,
  getDraftWorkOrders,
} from '../controllers/draftWorkOrder.controllers'
import { validateBody } from '../middlewares/validate'
import { createWorkOrderFromDraftWorkOrderDto } from '../schemas/draftWorkOrder'

export const draftWorkOrderRoute = '/work-orders/draft'

const draftWorkOrderRouter = Router()

draftWorkOrderRouter.get('/', getDraftWorkOrders)
draftWorkOrderRouter.put(
  '/:id',
  validateBody(createWorkOrderFromDraftWorkOrderDto),
  createWorkOrderFromDraftWorkOrder
)
draftWorkOrderRouter.delete('/:id', deleteDraftWorkOrderByCode)

export default draftWorkOrderRouter
