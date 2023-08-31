import { z } from 'zod'

const authUserShape = {
  username: z
    .string({
      required_error: 'El nombre de usuario es requerido',
      invalid_type_error: 'El nombre de usuario debe ser un texto',
    })
    .min(1, 'El nombre de usuario debe tener al menos 1 caracter'),
  password: z
    .string({
      required_error: 'La contraseña es requerida',
      invalid_type_error: 'La contraseña debe ser un texto',
    })
    .min(1, 'La contraseña debe tener al menos 1 caracter'),
}

type UserRole = 'admin' | 'operator'
export interface User extends AuthUser {
  role: UserRole
}

export const authUserDto = z.object(authUserShape)
export type AuthUser = z.infer<typeof authUserDto>
