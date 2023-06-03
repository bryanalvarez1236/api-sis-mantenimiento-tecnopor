import { Request, Response } from 'express'
import * as historicalService from '../services/historical.service'
import { ThrowError } from '../services'

export async function getHistoricalSummary(
  req: Request<{ machineCode: string }, never, never, { lte?: string }>,
  res: Response
) {
  const { machineCode } = req.params
  const date = req.query.lte ?? new Date()
  try {
    const historicalSummary = await historicalService.getHistoricalSummary({
      machineCode,
      date,
    })
    return res.json(historicalSummary)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getHistorical(
  req: Request<{ machineCode: string }, never, never, { lte?: string }>,
  res: Response
) {
  const { machineCode } = req.params
  const date = req.query.lte ?? new Date()
  try {
    const historical = await historicalService.getHistorical({
      machineCode,
      date,
    })
    return res.json(historical)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}
