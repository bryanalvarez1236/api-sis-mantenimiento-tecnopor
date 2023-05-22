import { Request, Response } from 'express'
import * as machineService from '../services/machine.service'
import { ThrowError } from '../services'
import type { CreateMachineDto, UpdateMachineDto } from '../schemas/machine'

export async function getMachines(_req: Request, res: Response) {
  try {
    const machines = await machineService.getMachines()
    return res.json(machines)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function createMachine(
  req: Request<never, never, CreateMachineDto>,
  res: Response
) {
  const { body, files } = req
  try {
    const response = await machineService.createMachine({
      createDto: body,
      files,
    })
    return res.status(201).json(response)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getMachineByCode(
  req: Request<{ code: string }>,
  res: Response
) {
  const {
    params: { code },
  } = req
  try {
    const foundMachine = await machineService.getMachineByCode({ code })
    return res.json(foundMachine)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function updateMachine(
  req: Request<{ code: string }, never, UpdateMachineDto>,
  res: Response
) {
  const { code } = req.params
  const { body, files } = req
  try {
    const updatedMachine = await machineService.updateMachineByCode({
      code,
      updateDto: body,
      files,
    })
    return res.json(updatedMachine)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}
