import { Request, Response } from 'express'
import * as workOrderService from '../services/workOrder.service'
import { ThrowError } from '../services'
import { WORK_ORDER_CHANGE_STATE } from '../schemas/workOrder'

export async function getWorkOrders(req: Request, res: Response) {
  const {
    query: { dateRange },
  } = req

  try {
    const workOrders = await workOrderService.getWorkOrders(dateRange as string)
    return res.json(
      workOrders.map(({ state, ...rest }) => ({
        ...rest,
        state,
        ...WORK_ORDER_CHANGE_STATE[state],
      }))
    )
  } catch (error) {
    const { message, status } = error as ThrowError
    return res
      .status(status ?? 500)
      .json({ message: message ?? 'Ocurrió algún error' })
  }
}

export async function getWorkOrderById(req: Request, res: Response) {
  const {
    params: { id },
  } = req

  try {
    const foundWorkOrder = await workOrderService.getWorkOrderById(id)
    const state = 'DOING'
    return res.json({
      ...foundWorkOrder,
      state,
      ...WORK_ORDER_CHANGE_STATE[state],
    })
  } catch (error) {
    const { message, status } = error as ThrowError
    return res
      .status(status ?? 500)
      .json({ message: message ?? 'Ocurrió algún error' })
  }
}

export async function createWorkOrder(req: Request, res: Response) {
  const { body } = req

  try {
    const { state, ...createdWorkOrder } =
      await workOrderService.createWorkOrder(body)
    return res.status(201).json({
      ...createdWorkOrder,
      state,
      ...WORK_ORDER_CHANGE_STATE[state],
    })
  } catch (error) {
    const { message, status } = error as ThrowError
    return res
      .status(status ?? 500)
      .json({ message: message ?? 'Ocurrió algún error' })
  }
}

export async function updateWorkOrder(req: Request, res: Response) {
  const {
    params: { id },
    body,
  } = req
  try {
    const { state, ...updatedWorkOrder } =
      await workOrderService.updateWorkOrderById(id, body)
    return res.json({
      ...updatedWorkOrder,
      state,
      ...WORK_ORDER_CHANGE_STATE[state],
    })
  } catch (error) {
    const { message, status } = error as ThrowError
    return res
      .status(status ?? 500)
      .json({ message: message ?? 'Ocurrió algún error' })
  }
}

export async function getWorkOrdersCount(_req: Request, res: Response) {
  const countAndMachines = await workOrderService.getWorkOrdersCount()
  return res.json(countAndMachines)
}
