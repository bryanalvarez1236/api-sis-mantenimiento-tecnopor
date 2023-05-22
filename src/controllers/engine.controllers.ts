import { Request, Response } from 'express'
import { ThrowError } from '../services'
import * as engineService from '../services/engine.service'

export async function getMachineEngines(
  req: Request<{ machineCode: string }>,
  res: Response
) {
  const { machineCode } = req.params
  try {
    const foundMachine = await engineService.getMachineEngines({ machineCode })
    return res.json(foundMachine)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getEngineByCode(
  req: Request<{ code: string }>,
  res: Response
) {
  const { code } = req.params
  try {
    const foundEngine = await engineService.getEngineByCode({ code })
    return res.json(foundEngine)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function addEngine(
  req: Request<{ machineCode: string }>,
  res: Response
) {
  const {
    params: { machineCode },
    body,
  } = req
  try {
    const createdEngine = await engineService.addEngine({
      machineCode,
      createDto: body,
    })
    return res.status(201).json(createdEngine)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function updateEngineByCode(
  req: Request<{ code: string }>,
  res: Response
) {
  const {
    params: { code },
    body,
  } = req
  try {
    const updatedEngine = await engineService.updateEngineByCode({
      code,
      updateDto: body,
    })
    return res.json(updatedEngine)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
