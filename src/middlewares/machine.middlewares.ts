import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { ServiceError } from '../services'
import { deleteUploadedFiles } from '../libs/files'

interface ValidateBodyWithFileProps {
  schema: AnyZodObject
  fileName: string
}

export function validateBodyWithFile({
  schema,
  fileName,
}: ValidateBodyWithFileProps) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { body, files } = req
    try {
      const result = await schema.parseAsync({
        ...body,
        [fileName]: files?.[fileName],
      })
      req.body = result
      return next()
    } catch (error) {
      deleteUploadedFiles(files)
      if (error instanceof ZodError) {
        const { issues } = error
        const message = issues.map(({ message }) => message).join('\n')
        return res.status(400).json({ message })
      }
      const { status, message } = new ServiceError({ status: 400 })
      return res.status(status).json({ message })
    }
  }
}
