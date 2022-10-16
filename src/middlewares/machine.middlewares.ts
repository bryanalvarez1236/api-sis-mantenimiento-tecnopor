import { NextFunction, Request, Response } from 'express'

export function transformBody(req: Request, res: Response, next: NextFunction) {
  const { body } = req
  if (body.technicalDocumentation) {
    try {
      const arrayTechnicalDocumentation = JSON.parse(
        body.technicalDocumentation
      )
      const technicalDocumentation = new Set(arrayTechnicalDocumentation)
      if (technicalDocumentation.size !== arrayTechnicalDocumentation.length) {
        throw Error()
      }
      body.technicalDocumentation = technicalDocumentation
    } catch (error) {
      return res.status(400).json({ message: 'Body invalid' })
    }
  }
  return next()
}
