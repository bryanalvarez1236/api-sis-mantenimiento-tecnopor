import { Router } from 'express'
import {
  createWorkOrderFromDraftWorkOrder,
  deleteDraftWorkOrderByCode,
  getDraftWorkOrders,
} from '../controllers/draftWorkOrder.controllers'

export const draftWorkOrderRoute = '/work-orders/draft'

const draftWorkOrderRouter = Router()

draftWorkOrderRouter.get('/', getDraftWorkOrders)
draftWorkOrderRouter.put('/:id', createWorkOrderFromDraftWorkOrder)
draftWorkOrderRouter.delete('/:id', deleteDraftWorkOrderByCode)

export default draftWorkOrderRouter
