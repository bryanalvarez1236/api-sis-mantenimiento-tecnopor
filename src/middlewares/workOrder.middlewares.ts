import { NextFunction, Request, Response } from 'express'
import {
  checkListVerified,
  updateWorkOrderGeneralDto,
  updateWorkOrderToDoingDto,
  updateWorkOrderToDoneDto,
} from '../schemas/workOrder'
import { ZodError } from 'zod'
import { ServiceError } from '../services'

export async function validateUpdateWorkOrderDto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { body } = req
  try {
    const { state, ...rest } = await updateWorkOrderGeneralDto.parseAsync(body)
    if (state === 'PLANNED' || state === 'VALIDATED') {
      req.body = { state }
      return next()
    }
    let result
    if (state === 'DOING') {
      result = await updateWorkOrderToDoingDto.parseAsync(rest)
    } else {
      result = !!body.activityDescription
        ? await updateWorkOrderToDoneDto.parseAsync(rest)
        : await checkListVerified.parseAsync(rest)
    }
    req.body = { state, ...result }
    return next()
  } catch (error) {
    if (error instanceof ZodError) {
      const { issues } = error
      const message = issues.map(({ message }) => message).join('\n')
      return res.status(400).json({ message })
    }
    const { status, message } = new ServiceError({ status: 400 })
    return res.status(status).json({ message })
  }
}
