import { Request, Response } from 'express'
import * as workOrderService from '../services/workOrder.service'
import { ThrowError } from '../services'
import {
  CreateWorkOrderDto,
  UpdateWorkOrderGeneralDto,
} from '../schemas/workOrder'

export async function getWorkOrders(
  req: Request<never, never, never, { date: string | undefined }>,
  res: Response
) {
  const {
    query: { date },
  } = req

  try {
    const workOrders = await workOrderService.getWorkOrders({ date })
    return res.json(workOrders)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getWorkOrderByCode(
  req: Request<{ code: string }, never, never, { state?: string }>,
  res: Response
) {
  const { code } = req.params
  const { state } = req.query
  try {
    const workOrder = await workOrderService.getWorkOrderByCode({
      code: +code,
      state,
    })
    return res.json(workOrder)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getWorkOrderById(
  req: Request<{ id: string }>,
  res: Response
) {
  const {
    params: { id },
  } = req

  try {
    const foundWorkOrder = await workOrderService.getWorkOrderById({ id: +id })
    return res.json(foundWorkOrder)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function createWorkOrder(
  req: Request<never, never, CreateWorkOrderDto>,
  res: Response
) {
  const { body } = req

  try {
    const createdWorkOrder = await workOrderService.createWorkOrder({
      createWorkOrderDto: body,
    })
    return res.status(201).json(createdWorkOrder)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function updateWorkOrder(
  req: Request<{ id: string }, never, UpdateWorkOrderGeneralDto>,
  res: Response
) {
  const {
    params: { id },
    body,
  } = req
  try {
    const updatedWorkOrder = await workOrderService.updateWorkOrderById({
      id: +id,
      updateWorkOrderDto: body,
    })
    return res.json(updatedWorkOrder)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getWorkOrdersCount(_req: Request, res: Response) {
  try {
    const countAndMachines = await workOrderService.getWorkOrdersCount()
    return res.json(countAndMachines)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function deleteWorkOrderByCode(
  req: Request<{ id: string }, never, never, never>,
  res: Response
) {
  const { id } = req.params
  try {
    const data = await workOrderService.deleteWorkOrderById({ id: +id })
    return res.json(data)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
