import { Request, Response } from 'express'
import { CreateMaintenanceRequestDto } from '../schemas/maintenanceRequest'
import * as maintenanceRequestService from '../services/maintenanceRequest.service'
import { ThrowError } from '../services'

export async function createMaintenanceRequest(
  req: Request<{ machineCode: string }, never, CreateMaintenanceRequestDto>,
  res: Response
) {
  const {
    params: { machineCode },
    body,
  } = req
  try {
    const response = await maintenanceRequestService.createMaintenanceRequest({
      machineCode,
      createDto: body,
    })
    return res.status(201).json(response)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getMaintenanceRequest(_req: Request, res: Response) {
  try {
    const response = await maintenanceRequestService.getMaintenanceRequest()
    return res.json(response)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function verifyMaintenanceRequest(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params
  try {
    const response = await maintenanceRequestService.verifyMaintenanceRequest(
      +id
    )
    return res.json(response)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
