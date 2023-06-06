import { PrismaClientValidationError } from '@prisma/client/runtime'
import { ServiceError } from '.'
import prisma from '../libs/db'
import {
  CreateStoreDto,
  StoreResponseDto,
  UpdateStoreDto,
  VerifyStoreDto,
} from '../schemas/store'
import { machineNotFoundMessage } from './machine.service'
import * as unitService from './unit.service'

export function storeNotFoundMessage(storeId: number) {
  return `El repuesto con el id '${storeId}' no existe`
}
export function storeAlreadyExistsMessage({
  machineName,
  storeName,
}: {
  machineName: string
  storeName: string
}) {
  return `El repuesto ${storeName} ya existe para la máquina ${machineName}`
}
export function storeIdValidationErrorMessage() {
  return 'El id del repuesto debe ser un número'
}
export function storeInsufficientAmountMessage(storeName: string) {
  return `El repuesto ${storeName} no tiene la cantidad suficiente`
}
export function storeUnverifiedAmountMessage({
  storeName,
  amount,
}: {
  storeName: string
  amount: number
}) {
  if (amount < 1) {
    return `No hay stock del repuesto ${storeName}`
  }
  return `Solo queda ${amount} en stock del repuesto ${storeName}`
}

interface TransformCreateStoreDtoProps {
  createDto: CreateStoreDto
}
async function transformCreateStoreDto({
  createDto,
}: TransformCreateStoreDtoProps) {
  const { unit, ...storeDto } = createDto
  const unitId = await unitService.getUnitId({ name: unit })
  return { ...storeDto, unitId }
}

interface AddStoreProps {
  machineCode: string
  createDto: CreateStoreDto
}
export async function addStore({ machineCode, createDto }: AddStoreProps) {
  const machine = await prisma.machine.findUnique({
    where: { code: machineCode },
    select: { name: true, stores: { where: { name: createDto.name } } },
  })
  if (machine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(machineCode),
    })
  }
  const [store] = machine.stores
  if (store != null) {
    if (!store.deleted) {
      const machineName = machine.name
      const storeName = createDto.name
      throw new ServiceError({
        status: 409,
        message: storeAlreadyExistsMessage({ machineName, storeName }),
      })
    }
    const storeDto = await transformCreateStoreDto({ createDto })
    const { id } = store
    return await prisma.store.update({
      where: { id },
      data: { ...storeDto, deleted: false },
      select: {
        id: true,
        name: true,
        unit: { select: { name: true } },
        amount: true,
        minimumAmount: true,
      },
    })
  }
  const storeDto = await transformCreateStoreDto({ createDto })
  return await prisma.store.create({
    data: { machineCode, ...storeDto },
    select: {
      id: true,
      name: true,
      unit: { select: { name: true } },
      amount: true,
      minimumAmount: true,
    },
  })
}

interface UpdateStoreByIdProps {
  id: number
  updateDto: UpdateStoreDto
}
export async function updateStoreById({ id, updateDto }: UpdateStoreByIdProps) {
  const store = await prisma.store.findUnique({ where: { id } })
  if (store == null || store.deleted) {
    throw new ServiceError({ status: 404, message: storeNotFoundMessage(id) })
  }
  return await prisma.store.update({
    where: { id },
    data: updateDto,
    select: {
      id: true,
      name: true,
      unit: { select: { name: true } },
      amount: true,
      minimumAmount: true,
    },
  })
}

export async function getAllStores() {
  const stores = await prisma.store.findMany({
    where: { deleted: false },
    select: {
      id: true,
      name: true,
      unit: { select: { name: true } },
      amount: true,
      minimumAmount: true,
      machine: { select: { code: true, name: true } },
    },
    orderBy: { machine: { name: 'asc' } },
  })

  const machines = stores.reduce(
    (
      acc: Record<string, { name: string; stores: StoreResponseDto[] }>,
      value
    ) => {
      const {
        machine: { code, name },
        ...store
      } = value
      const machine = acc[code] ?? { name, stores: [] }
      const { stores } = machine
      return { ...acc, [code]: { ...machine, stores: [...stores, store] } }
    },
    {}
  )

  return Object.entries(machines).map(([code, { name, stores }]) => ({
    code,
    name,
    stores: stores.sort(
      (
        { amount: a1, minimumAmount: m1, name: n1 },
        { amount: a2, minimumAmount: m2, name: n2 }
      ) => {
        const result = +(a2 < m2) - +(a1 < m1)
        if (result === 0) {
          return n1.localeCompare(n2)
        }
        return result
      }
    ),
  }))
}

interface DeleteStoreByIdProps {
  id: number
}
export async function deleteStoreById({ id }: DeleteStoreByIdProps) {
  try {
    const storeFound = await prisma.store.findUnique({
      where: { id },
      select: {
        amount: true,
        deleted: true,
      },
    })
    if (storeFound == null || storeFound.deleted) {
      throw new ServiceError({ status: 404, message: storeNotFoundMessage(id) })
    }
    const { amount } = storeFound
    const { name, unit, minimumAmount } = await prisma.store.update({
      where: { id },
      data: { deleted: true, amount: 0 },
      select: {
        name: true,
        unit: { select: { name: true } },
        minimumAmount: true,
      },
    })
    return { id, name, unit, amount, minimumAmount }
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error
    }
    if (error instanceof PrismaClientValidationError) {
      throw new ServiceError({
        status: 400,
        message: storeIdValidationErrorMessage(),
      })
    }
    throw new ServiceError({ status: 500 })
  }
}

export async function getFieldsToCreate() {
  const machines = await prisma.machine.findMany({
    select: { code: true, name: true },
    orderBy: { name: 'asc' },
  })
  const units = await prisma.unit.findMany({
    where: { id: { not: 0 } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return { machines, units }
}

interface UpdateStoresProps {
  machineCode: string
  workOrderCode: number
  stores: { name: string; amount: number }[]
}
export async function updateStores({
  machineCode,
  workOrderCode,
  stores,
}: UpdateStoresProps) {
  const storeSet = stores.reduce((acc: typeof stores, value) => {
    const index = acc.findIndex(({ name }) => name === value.name)
    if (index >= 0) {
      const store = acc[index]
      store.amount += value.amount
      acc[index] = store
      return [...acc]
    }
    return [...acc, value]
  }, [])

  for (const { name, amount } of storeSet) {
    const workOrders = { create: { amount, workOrderCode } }
    const foundStore = await prisma.store.findFirst({
      where: { machineCode, name },
      select: { id: true, amount: true, deleted: true },
    })
    if (foundStore == null || foundStore.deleted) {
      const id = foundStore?.id ?? 0
      await prisma.store.upsert({
        where: { id },
        update: {
          workOrders,
        },
        create: {
          name,
          amount: 0,
          minimumAmount: 1,
          machineCode,
          unitId: 0,
          deleted: true,
          workOrders,
        },
      })
      continue
    }

    const result = foundStore.amount - amount
    if (result < 0) {
      throw new ServiceError({
        status: 406,
        message: storeInsufficientAmountMessage(name),
      })
    }

    const { id } = foundStore
    await prisma.store.update({
      where: { id },
      data: {
        amount: result,
        workOrders,
      },
    })
  }
}

interface VerifyStoreProps {
  store: VerifyStoreDto
}
export async function verifyStore({ store }: VerifyStoreProps) {
  const { machineCode, name, amount } = store
  const foundStore = await prisma.store.findFirst({
    where: { machineCode, name, deleted: false },
    select: { amount: true },
  })
  if (foundStore != null && foundStore.amount < amount) {
    throw new ServiceError({
      status: 405,
      message: storeUnverifiedAmountMessage({
        storeName: name,
        amount: foundStore.amount,
      }),
    })
  }
  return { name, amount }
}
