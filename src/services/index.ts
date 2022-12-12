export type HttpStatus = 400 | 404 | 405 | 406 | 412

export interface ThrowError {
  message: string
  status: HttpStatus
}

export class ServiceError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: HttpStatus,
    public readonly name: string = 'ServiceError'
  ) {
    super(message)
    super.name = name
  }
}
