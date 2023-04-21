import { Request, Response } from 'express'
import { type WorkOrderOnScheduleDto } from '../services/schedule.service'
import * as scheduleServices from '../services/schedule.service'
import { ThrowError } from '../services'

export async function getSchedule(
  req: Request<never, never, never, { date?: string; strict?: string }>,
  res: Response
) {
  const { date, strict = 'true' } = req.query
  try {
    const schedule = await scheduleServices.getSchedule({ date, strict })
    return res.json(schedule)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function workOrderOnSchedule(
  req: Request<{ id: string }, never, WorkOrderOnScheduleDto>,
  res: Response
) {
  const {
    params: { id },
    body,
  } = req

  try {
    const workOrderOnSchedule = await scheduleServices.workOrderOnSchedule({
      id: +id,
      workOrderOnScheduleDto: body,
    })
    return res.json(workOrderOnSchedule)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
