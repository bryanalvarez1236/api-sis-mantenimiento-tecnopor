import { Prisma, PrismaPromise } from '@prisma/client'

export type HttpStatus = 400 | 404 | 405 | 406 | 409 | 412 | 500

export interface ThrowError {
  message?: string
  status: HttpStatus
}

export class ServiceError extends Error {
  private static DEFAULT_MESSAGE = 'Ocurrió algún error'
  public readonly name = 'ServiceError'
  public readonly status: HttpStatus
  public readonly message: string
  constructor(throwError: ThrowError) {
    const message = throwError.message ?? ServiceError.DEFAULT_MESSAGE
    super(message)
    this.status = throwError.status
    this.message = message
  }
}

export const PRISMA_NOT_FOUND_ERROR_CODE = 'P2025'
export const PRISMA_UNIQUE_ERROR_CODE = 'P2002'
// export const PRISMA_FOREING_KEY_FAILED_ERROR_CODE = 'P2003'

export type CheckSelect<T, EntityClient, PayloadClient> = Prisma.CheckSelect<
  T,
  EntityClient,
  PayloadClient
>
export type ReturnCheck<T, S, U> = Promise<CheckSelect<T, S, U>>
export type PromiseArray<E> = PrismaPromise<Array<E>>
type Null = never | null | undefined

export type JoinArgs<T, D> = {
  [key in keyof T & keyof D]: T[key] extends Null
    ? D[key]
    : D[key] extends Null
    ? T[key]
    : D[key] & T[key]
}

interface EntityFindUniqueArgs {
  where: Record<string, unknown>
  include?: Record<string, unknown> | null
  select?: Record<string, unknown> | null
}

type GetArgs<T> = {
  [key in keyof T]: T[key]
}

export type FindUniqueType<E extends EntityFindUniqueArgs> = Pick<
  E,
  'include' | 'select'
>
type SelectSubset<
  T extends FindUniqueType<E>,
  E extends EntityFindUniqueArgs
> = Prisma.SelectSubset<T, E>
export type FindUniqueArgs<
  T extends FindUniqueType<GetArgs<E>>,
  E extends EntityFindUniqueArgs
> = GetArgs<SelectSubset<T, GetArgs<E>>>

export function getFindUniqueArgsConfig<
  E extends EntityFindUniqueArgs,
  T extends FindUniqueType<E>
>(defaultValues: GetArgs<E>, config?: FindUniqueArgs<T, E>) {
  const { where } = defaultValues
  let include = defaultValues.include
  include = config?.include ? { ...include, ...config?.include } : include
  let select = defaultValues.select
  select = config?.select ? { ...select, ...config?.select } : select
  const s = {
    where: where,
    include,
    select,
  }
  return s as Prisma.SelectSubset<T & { where: E['where'] }, E>
}

interface EntityFindManyArgs {
  cursor?: Record<string, unknown>
  distinct?: Prisma.Enumerable<unknown>
  include?: Record<string, unknown> | null
  orderBy?: Prisma.Enumerable<unknown>
  select?: Record<string, unknown> | null
  skip?: number
  take?: number
  where?: Record<string, unknown>
}

export type FindManyArgs<T> = GetArgs<T>

export function getFindManyArgsConfig<T extends EntityFindManyArgs>(
  defaultValues: T,
  config?: FindManyArgs<T>
) {
  let cursor = defaultValues.cursor
  cursor = config?.cursor ? { ...cursor, ...config?.cursor } : cursor
  let distinct = defaultValues.distinct
  distinct = config?.distinct ? config.distinct : distinct
  let include = defaultValues.include
  include = config?.include ? { ...include, ...config?.include } : include
  let orderBy = defaultValues.orderBy
  orderBy = config?.orderBy ? config.orderBy : orderBy
  let select = defaultValues.select
  select = config?.select ? { ...select, ...config?.select } : select
  let skip = defaultValues.skip
  skip = config?.skip ? config.skip : skip
  let take = defaultValues.take
  take = config?.take ? config.take : take
  let where = defaultValues.where
  where = config?.where ? { ...where, ...config?.where } : where
  return {
    cursor,
    distinct,
    orderBy,
    include,
    select,
    skip,
    take,
    where,
  } as Prisma.SelectSubset<T, T>
}

interface EntityCreateArgs {
  data: Record<string, unknown>
  select?: Record<string, unknown> | null
  include?: Record<string, unknown> | null
}
export type CreateArgsType<T extends EntityCreateArgs> = Omit<T, 'data'>

export function getCreateArgsConfig<T extends EntityCreateArgs>(
  defaultValues: T,
  config?: Omit<T, 'data'>
) {
  const { data } = defaultValues
  let include = defaultValues.include
  include = config?.include ? { ...include, ...config?.include } : include
  let select = defaultValues.select
  select = config?.select ? { ...select, ...config?.select } : select
  return {
    data,
    include,
    select,
  } as Prisma.SelectSubset<T, T>
}

interface EntityUpdateArgs {
  data: Record<string, unknown>
  where: Record<string, unknown>
  select?: Record<string, unknown> | null
  include?: Record<string, unknown> | null
}
export type UpdateArgsType<T extends EntityUpdateArgs> = Omit<
  T,
  'data' | 'where'
>

export function getUpdateArgsConfig<T extends EntityUpdateArgs>(
  defaultValues: T,
  config?: UpdateArgsType<T>
) {
  const { data, where } = defaultValues
  let include = defaultValues.include
  include = config?.include ? { ...include, ...config?.include } : include
  let select = defaultValues.select
  select = config?.select ? { ...select, ...config?.select } : select
  return {
    data,
    where,
    include,
    select,
  } as Prisma.SelectSubset<T, T>
}

interface EntityDeleteArgs {
  where: Record<string, unknown>
  select?: Record<string, unknown> | null
  include?: Record<string, unknown> | null
}
export type DeleteArgsType<T extends EntityDeleteArgs> = Omit<T, 'where'>

export function getDeleteArgsConfig<T extends EntityDeleteArgs>(
  defaultValues: T,
  config?: DeleteArgsType<T>
) {
  const { where } = defaultValues
  let include = defaultValues.include
  include = config?.include ? { ...include, ...config?.include } : include
  let select = defaultValues.select
  select = config?.select ? { ...select, ...config?.select } : select
  return {
    where,
    include,
    select,
  } as Prisma.SelectSubset<T, T>
}
