import { Request, Response } from 'express'
import prisma from '../libs/db'

export async function getMachineEngines(req: Request, res: Response) {
  const {
    params: { machineCode },
  } = req

  const foundMachine = await prisma.machine.findUnique({
    where: { code: machineCode },
    include: { engines: true, image: { select: { url: true } } },
  })

  if (!foundMachine) {
    return res
      .status(404)
      .json({ message: `La máquina con el código '${machineCode}' no existe` })
  }

  return res.json(foundMachine)
}

export async function getEngineByCode(req: Request, res: Response) {
  const {
    params: { machineCode, engineCode },
  } = req

  const foundEngine = await prisma.engine.findUnique({
    where: { code: engineCode },
  })

  if (!foundEngine) {
    return res
      .status(404)
      .json({ message: `El motor con el código '${engineCode}' no existe` })
  }

  if (foundEngine.machineCode !== machineCode) {
    return res.status(406).json({
      message: `El motor no está disponible en la máquina con el código '${machineCode}'`,
    })
  }

  return res.json(foundEngine)
}

export async function createEngine(req: Request, res: Response) {
  const {
    params: { machineCode },
    body,
  } = req

  const foundMachine = await prisma.machine.findUnique({
    where: { code: machineCode },
  })

  if (!foundMachine) {
    return res
      .status(404)
      .json({ message: `La máquina con el código '${machineCode}' no existe` })
  }

  const createdEngine = await prisma.engine.create({
    data: { ...body, machine: { connect: { code: machineCode } } },
  })

  return res.status(201).json(createdEngine)
}

export async function updateEngineByCode(req: Request, res: Response) {
  const {
    params: { machineCode, engineCode },
    body,
  } = req

  const foundEngine = await prisma.engine.findUnique({
    where: { code: engineCode },
    select: { machineCode: true },
  })

  if (!foundEngine) {
    return res
      .status(404)
      .json({ message: `El motor con el código '${engineCode}' no existe` })
  }

  if (foundEngine.machineCode !== machineCode) {
    return res.status(406).json({
      message: `El motor a actualizar no está disponible en la máquina con el código '${machineCode}'`,
    })
  }

  const updatedEngine = await prisma.engine.update({
    where: { code: engineCode },
    data: body,
  })

  return res.json(updatedEngine)
}
