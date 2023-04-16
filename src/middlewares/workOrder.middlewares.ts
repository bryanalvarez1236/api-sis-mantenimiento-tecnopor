import { NextFunction, Request, Response } from 'express'
import {
  checkListVerified,
  updateWorkOrderGeneralDto,
  updateWorkOrderToDoingDto,
  updateWorkOrderToDoneDto,
} from '../schemas/workOrder'

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
    const { allow } = body
    req.body = { state, allow, ...result }
    return next()
  } catch (error) {
    return res.status(400).json(error)
  }
}
