import { NextFunction, Request, Response } from 'express'

export function failureReportTransformBody(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const { stopHours } = req.body
  if (stopHours !== '' && !isNaN(stopHours)) {
    req.body.stopHours = +stopHours
  }
  return next()
}
