import { NextFunction, Request, Response } from 'express'

export function transformBody(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const { body } = req
  const { technicalDocumentation: technicalDocumentationInput } = body
  if (technicalDocumentationInput) {
    if (typeof technicalDocumentationInput === 'string') {
      body.technicalDocumentation = [technicalDocumentationInput]
    } else {
      const technicalDocumentation = new Set(technicalDocumentationInput)
      body.technicalDocumentation = [...technicalDocumentation]
    }
  } else {
    body.technicalDocumentation = []
  }
  return next()
}
