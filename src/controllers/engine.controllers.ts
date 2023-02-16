import { Request, Response } from 'express'
import { ThrowError } from '../services'
import * as engineService from '../services/engine.service'

export async function getMachineEngines(req: Request, res: Response) {
  const {
    params: { machineCode },
  } = req
  try {
    const foundMachine = await engineService.getMachineEngines(machineCode)
    return res.json(foundMachine)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getEngineByCode(req: Request, res: Response) {
  const {
    params: { engineCode },
  } = req

  try {
    const foundEngine = await engineService.getEngineByCode(engineCode)
    return res.json(foundEngine)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function createEngine(req: Request, res: Response) {
  const {
    params: { machineCode },
    body,
  } = req

  try {
    const createdEngine = await engineService.createEngine(body, machineCode)
    return res.status(201).json(createdEngine)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function updateEngineByCode(req: Request, res: Response) {
  const {
    params: { engineCode },
    body,
  } = req

  try {
    const updatedEngine = await engineService.updateEngineByCode(
      engineCode,
      body
    )
    return res.json(updatedEngine)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
