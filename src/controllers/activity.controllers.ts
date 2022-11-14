import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { Request, Response } from 'express'
import prisma from '../libs/db'

export async function getMachineActivitiesByMachineCode(
  req: Request,
  res: Response
) {
  const { query } = req

  const machineCode = `${query.machineCode}`

  const foundMachine = await prisma.machine.findUnique({
    where: { code: machineCode },
    include: { activities: true },
  })

  if (!foundMachine) {
    return res
      .status(404)
      .json({ message: `La máquina con el código '${machineCode}' no existe` })
  }

  const { activities, name } = foundMachine

  return res.json({ activities, machineName: name })
}

export async function getActivityByCode(req: Request, res: Response) {
  const {
    params: { code },
    query: { machineCode },
  } = req

  const foundActivity = await prisma.activity.findUnique({ where: { code } })

  if (!foundActivity) {
    return res
      .status(404)
      .json({ message: `La actividad con el código '${code}' no existe` })
  }

  if (foundActivity.machineCode !== machineCode) {
    return res.status(406).json({
      message: `La actividad no está disponible en la máquina con el código '${machineCode}'`,
    })
  }

  return res.json(foundActivity)
}

export async function createActivity(req: Request, res: Response) {
  const { body } = req
  try {
    const { machineCode } = body
    const foundMachine = await prisma.machine.findUnique({
      where: { code: machineCode },
    })
    if (!foundMachine) {
      return res.status(404).json({
        message: `La máquina con el código '${machineCode}' no existe`,
      })
    }
    const createdActivity = await prisma.activity.create({ data: body })
    return res.status(201).json(createdActivity)
  } catch (error) {
    const { code } = error as PrismaClientKnownRequestError
    if (code && code === 'P2002') {
      const { code } = body
      return res
        .status(409)
        .json({ message: `La actividad con el código '${code}' ya existe` })
    } else {
      console.log({ error })
      return res.status(500).json(error)
    }
  }
}

export async function updateActivityByCode(req: Request, res: Response) {
  const {
    body,
    params: { code },
  } = req

  const foundActivity = await prisma.activity.findUnique({
    where: { code },
    select: { machineCode: true },
  })

  if (!foundActivity) {
    return res
      .status(404)
      .json({ message: `La actividad con el código '${code}' no existe` })
  }

  const { machineCode, ...activityDto } = body

  if (machineCode !== foundActivity.machineCode) {
    return res.status(406).json({
      message: `La actividad no está disponible en la máquina con el código '${machineCode}'`,
    })
  }

  const updatedActivity = await prisma.activity.update({
    where: { code },
    data: activityDto,
  })

  return res.json(updatedActivity)
}

export async function deleteActivityByCode(req: Request, res: Response) {
  const {
    params: { code },
    query,
  } = req

  const machineCode = `${query.machineCode}`

  const foundActivity = await prisma.activity.findUnique({
    where: { code },
    select: { machineCode: true },
  })

  if (!foundActivity) {
    return res
      .status(404)
      .json({ message: `La actividad con el código '${code}' no existe` })
  }

  if (machineCode !== foundActivity.machineCode) {
    return res.status(406).json({
      message: `La actividad no está disponible en la máquina con el código '${machineCode}'`,
    })
  }

  await prisma.activity.delete({ where: { code } })

  return res.status(204).send()
}
