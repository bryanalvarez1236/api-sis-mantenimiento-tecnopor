import { Request, Response } from 'express'
import { ThrowError } from '../services'
import * as activityService from '../services/activity.service'
import { CreateActivityDto, UpdateActivityDto } from '../schemas/activity'

export async function getMachineActivities(
  req: Request<never, never, never, { machineCode: string }>,
  res: Response
) {
  const { machineCode } = req.query
  try {
    const machineActivities = await activityService.getMachineActivities({
      machineCode,
    })
    return res.json(machineActivities)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getActivityByCode(
  req: Request<{ code: string }>,
  res: Response
) {
  const { code } = req.params
  try {
    const foundActivity = await activityService.getActivityByCode({ code })
    return res.json(foundActivity)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function createActivity(
  req: Request<never, never, CreateActivityDto>,
  res: Response
) {
  const { body } = req
  try {
    const createdActivity = await activityService.createActivity({
      createDto: body,
    })
    return res.status(201).json(createdActivity)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function updateActivityByCode(
  req: Request<{ code: string }, never, UpdateActivityDto>,
  res: Response
) {
  const {
    body,
    params: { code },
  } = req

  try {
    const updatedActivity = await activityService.updateActivityByCode({
      code,
      updateDto: body,
    })
    return res.json(updatedActivity)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function deleteActivityByCode(
  req: Request<{ code: string }>,
  res: Response
) {
  const { code } = req.params

  try {
    const deletedActivity = await activityService.deleteActivityByCode({ code })
    return res.json(deletedActivity)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getFieldsToCreateActivity(
  req: Request<never, never, never, { machineCode: string }>,
  res: Response
) {
  const { machineCode = '' } = req.query
  try {
    const response = await activityService.getFieldsToCreateActivity({
      machineCode: `${machineCode}`,
    })
    return res.json(response)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
