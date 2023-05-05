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
