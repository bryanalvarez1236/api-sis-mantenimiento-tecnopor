import { NextFunction, Request, Response } from 'express'
import {
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
  console.log({ body })
  try {
    const { state, ...rest } = await updateWorkOrderGeneralDto.parseAsync(body)
    if (state === 'PLANNED' || state === 'VALIDATED') {
      req.body = { state }
      return next()
    }
    const result =
      state === 'DOING'
        ? await updateWorkOrderToDoingDto.parseAsync(rest)
        : await updateWorkOrderToDoneDto.parseAsync(rest)
    console.log({ result })
    req.body = { state, ...result }
    return next()
  } catch (error) {
    console.log({ error })
    return res.status(400).json(error)
  }
}
