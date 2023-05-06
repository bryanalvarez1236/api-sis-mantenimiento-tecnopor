import { Request, Response } from 'express'
import { CreateFailureReportDto } from '../schemas/failureReport'
import * as failureReportService from '../services/failureReport.service'
import { ThrowError } from '../services'

export async function createFailureReport(
  req: Request<{ machineCode: string }, never, CreateFailureReportDto>,
  res: Response
) {
  const { machineCode } = req.params
  const { body, files } = req
  try {
    const response = await failureReportService.createFailureReport({
      machineCode,
      createDto: body,
      files,
    })
    return res.status(201).json(response)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getFailureReports(_req: Request, res: Response) {
  try {
    const response = await failureReportService.getFailureReports()
    return res.json(response)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
