import { Request, Response } from 'express'
import * as machineService from '../services/machine.service'
import { ThrowError } from '../services'
import type { CreateMachineDto, UpdateMachineDto } from '../schemas/machine'
import { deleteUploadedFiles } from '../libs/files'

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
  let status = 201
  let data
  try {
    data = await machineService.createMachine({
      createDto: body,
    })
  } catch (error) {
    const { message, status: errorStatus } = error as ThrowError
    status = errorStatus
    data = { message }
  } finally {
    deleteUploadedFiles(files)
  }
  return res.status(status).json(data)
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
  const { body: updateDto, files } = req
  let status = 200
  let data
  try {
    data = await machineService.updateMachineByCode({ code, updateDto })
  } catch (error) {
    const { message, status: errorStatus } = error as ThrowError
    status = errorStatus
    data = { message }
  } finally {
    deleteUploadedFiles(files)
  }
  return res.status(status).json(data)
}

export async function getFieldsToCreateMachine(_req: Request, res: Response) {
  const fields = await machineService.getFieldsToCreateMachine()
  return res.json(fields)
}
export async function getFieldsToUpdateMachine(
  req: Request<{ code: string }>,
  res: Response
) {
  const { code } = req.params
  try {
    const response = await machineService.getFieldsToUpdateMachine({ code })
    return res.json(response)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
