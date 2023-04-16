import { Request, Response } from 'express'
import { getDateBoliviaTimeZone } from '../libs/date'
import { ThrowError } from '../services'
import * as draftWorkOrderService from '../services/draftWorkOrder.service'

export async function getDraftWorkOrders(req: Request, res: Response) {
  const now = getDateBoliviaTimeZone()
  const { query } = req
  const year = query.year ? Number(query.year as string) : now.getFullYear()
  const month = query.month ? Number(query.month) : now.getMonth()
  const day = query.day ? Number(query.day) : now.getDate()

  try {
    const draftWorkOrders = await draftWorkOrderService.getDraftWorkOrders({
      year,
      month,
      day,
    })
    return res.json(draftWorkOrders)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res
      .status(status ?? 500)
      .json({ message: message ?? 'Ocurrió algún error' })
  }
}

export async function createWorkOrderFromDraftWorkOrder(
  req: Request,
  res: Response
) {
  const {
    body,
    params: { id },
  } = req

  try {
    const workOrderCreated =
      await draftWorkOrderService.createWorkOrderFromDraftWorkOrder(
        Number(id),
        body
      )
    return res.json(workOrderCreated)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res
      .status(status ?? 500)
      .json({ message: message ?? 'Ocurrió algún error' })
  }
}

export async function deleteDraftWorkOrderByCode(req: Request, res: Response) {
  const {
    params: { id },
  } = req
  const code = Number(id)
  try {
    await draftWorkOrderService.deleteDraftWorkOrderByCode(code)
    return res.send()
  } catch (error) {
    const { message, status } = error as ThrowError
    return res
      .status(status ?? 500)
      .json({ message: message ?? 'Ocurrió algún error' })
  }
}
