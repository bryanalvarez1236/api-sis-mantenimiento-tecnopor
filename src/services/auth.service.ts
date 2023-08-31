import type { AuthUser, User } from '../schemas/auth'
import bycript from 'bcrypt'
import userData from '../db/users.json'
import { ServiceError } from '.'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/environment'

const users: User[] = userData as User[]
// const SALT = 8

// admin:admin1234
// operador:operador1234

async function validateUser(user: AuthUser) {
  const { username, password } = user
  const foundUser = users.find((user) => user.username === username)
  if (foundUser == null) {
    throw new ServiceError({
      status: 401,
      message: 'El usuario o la contraseña es inválida',
    })
  }
  const isValid = await bycript.compare(password, foundUser.password)
  if (!isValid) {
    throw new ServiceError({
      status: 401,
      message: 'El usuario o la contraseña es inválida',
    })
  }
  return foundUser
}

interface LoginProps {
  authUser: AuthUser
}
export async function login({ authUser }: LoginProps) {
  const { username, role } = await validateUser(authUser)
  const token = jwt.sign({ username, role }, JWT_SECRET)
  return { token, role }
}
