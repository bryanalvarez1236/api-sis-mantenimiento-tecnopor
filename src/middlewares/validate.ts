import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { ServiceError } from '../services'
import * as fs from 'fs-extra'

export const validateBody =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { body, files } = req
    try {
      const result = await schema.parseAsync(body)
      req.body = result
      return next()
    } catch (error) {
      if (files != null) {
        for (const file of Object.values(files)) {
          if (!(file instanceof Array)) {
            const { tempFilePath } = file
            if (fs.existsSync(tempFilePath)) {
              await fs.unlink(tempFilePath)
            }
          }
        }
      }
      if (error instanceof ZodError) {
        const { issues } = error
        const message = issues.map(({ message }) => message).join('\n')
        return res.status(400).json({ message })
      }
      const { status, message } = new ServiceError({ status: 400 })
      return res.status(status).json({ message })
    }
  }
