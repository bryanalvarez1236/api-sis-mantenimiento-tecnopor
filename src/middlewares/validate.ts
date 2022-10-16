import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'

export const validateBody =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req
      const result = await schema.parseAsync(body)
      req.body = result
      return next()
    } catch (error) {
      return res.status(400).json(error)
    }
  }
