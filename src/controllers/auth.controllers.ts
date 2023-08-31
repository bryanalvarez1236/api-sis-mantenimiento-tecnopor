import { Request, Response } from 'express'
import { AuthUser } from '../schemas/auth'
import * as authService from '../services/auth.service'
import { ThrowError } from '../services'

export async function login(
  req: Request<never, never, AuthUser>,
  res: Response
) {
  const authUser = req.body
  try {
    const response = await authService.login({ authUser })
    return res.json(response)
  } catch (error) {
    const { message, status } = error as ThrowError
    return res.status(status).json({ message })
  }
}
