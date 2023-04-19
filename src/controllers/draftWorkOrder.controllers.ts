import { Request, Response } from 'express'
import { ThrowError } from '../services'
import * as draftWorkOrderService from '../services/draftWorkOrder.service'
import { CreateWorkOrderFromDraftWorkOrderDto } from '../schemas/draftWorkOrder'

export async function getDraftWorkOrders(
  req: Request<never, never, never, { date?: string }>,
  res: Response
) {
  const { date } = req.query
  try {
    const draftWorkOrders = await draftWorkOrderService.getDraftWorkOrders({
      date,
    })
    return res.json(draftWorkOrders)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function createWorkOrderFromDraftWorkOrder(
  req: Request<{ id: string }, never, CreateWorkOrderFromDraftWorkOrderDto>,
  res: Response
) {
  const {
    body,
    params: { id },
  } = req

  try {
    const workOrderCreated =
      await draftWorkOrderService.createWorkOrderFromDraftWorkOrder({
        id: +id,
        createWorkOrderFromDraftWorkOrder: body,
      })
    return res.json(workOrderCreated)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function deleteDraftWorkOrderByCode(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params
  try {
    await draftWorkOrderService.deleteDraftWorkOrderByCode({ id: +id })
    return res.send()
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
