import { Router } from 'express'
import { validateBody } from '../middlewares/validate'
import { authUserDto } from '../schemas/auth'
import { login } from '../controllers/auth.controllers'

export const authRoute = '/auth'

const authRouter = Router()

authRouter.post('/login', validateBody(authUserDto), login)

export default authRouter
