import { Request, Response } from 'express'
import * as machineService from '../services/machine.service'
import { ThrowError } from '../services'

export async function getAllMachines(_req: Request, res: Response) {
  const machines = await machineService.getAllMachines({
    orderBy: { name: 'asc' },
  })
  return res.json(machines)
}

export async function createMachine(req: Request, res: Response) {
  const { body, files } = req
  try {
    const createdMachine = await machineService.createMachine(body, files)
    return res.status(201).json(createdMachine)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getMachineByCode(req: Request, res: Response) {
  const {
    params: { code },
  } = req
  try {
    const foundMachine = await machineService.getMachineByCode(code)
    return res.json(foundMachine)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function updateMachine(req: Request, res: Response) {
  const {
    params: { code },
  } = req
  const { body, files } = req
  try {
    const updatedMachine = await machineService.updateMachineByCode(
      code,
      body,
      files
    )
    return res.json(updatedMachine)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}
