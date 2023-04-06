import { Request, Response } from 'express'
import { ThrowError } from '../services'
import * as activityService from '../services/activity.service'

export async function getMachineActivitiesByMachineCode(
  req: Request,
  res: Response
) {
  const {
    query: { machineCode },
  } = req
  try {
    const machineActivities =
      await activityService.getMachineActivitiesByMachineCode(`${machineCode}`)
    return res.json(machineActivities)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getActivityByCode(req: Request, res: Response) {
  const {
    params: { code },
  } = req
  try {
    const foundActivity = await activityService.getActivityByCode(code)
    return res.json(foundActivity)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function createActivity(req: Request, res: Response) {
  const { body } = req
  try {
    const createdActivity = await activityService.createActivity(body)
    return res.status(201).json(createdActivity)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function updateActivityByCode(req: Request, res: Response) {
  const {
    body,
    params: { code },
  } = req

  try {
    const updatedActivity = await activityService.updateActivityByCode(
      code,
      body
    )
    return res.json(updatedActivity)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function deleteActivityByCode(req: Request, res: Response) {
  const {
    params: { code },
  } = req

  try {
    const deletedActivity = await activityService.deleteActivityByCode(code)
    return res.json(deletedActivity)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}
