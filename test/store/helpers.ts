import {
  STORE_ROUTE,
  STORE_WITH_MACHINE_ROUTE,
} from '../../src/routes/store.routes'
import {
  CreateStoreDto,
  StoreResponseDto,
  UpdateStoreDto,
} from '../../src/schemas/store'
import { serverRoute } from '../helpers/api'
import { MACHINE_ROUTES, machines } from '../machine/helpers'
import { units } from '../unit/helpers'
import storeData from './stores.json'
import { Store } from '@prisma/client'

export const STORE_ROUTES = {
  base: `${serverRoute}${STORE_ROUTE}`,
  baseWithMachine: (machineCode: string) =>
    `${MACHINE_ROUTES.base}${STORE_WITH_MACHINE_ROUTE}`.replace(
      ':machineCode',
      machineCode
    ),
  baseWithId: (id: number) => `${serverRoute}${STORE_ROUTE}/${id}`,
}

export const stores: Store[] = storeData as never as Store[]

const STORE = stores[1]
export const STORE_ID = STORE.id
export const STORE_RESPONSE_DTO: StoreResponseDto = {
  id: STORE_ID,
  name: STORE.name,
  unit: { name: units.find(({ id }) => id === STORE.unitId)?.name ?? '' },
  amount: STORE.amount,
  minimumAmount: STORE.minimumAmount,
}
export const DELETED_STORE_ID = stores[0].id

export const MACHINE_CODE = 'CB-04-PRX-01'
export const MACHINE_NAME = 'PRE EXPANSORA'

export const STORE_ALREADY_EXISTS: Omit<Store, 'id' | 'deleted'> = {
  machineCode: MACHINE_CODE,
  name: 'SELLOS DE GOMA DE NITRILO',
  unitId: units[1].id,
  amount: 4,
  minimumAmount: 2,
}
export const DELETED_STORE: Omit<Store, 'id'> = {
  machineCode: MACHINE_CODE,
  name: 'RODAMIENTOS 6205',
  unitId: units[0].id,
  amount: 0,
  minimumAmount: 1,
  deleted: true,
}

export const CREATE_STORE_DTO: CreateStoreDto = {
  name: 'ANILLO DE GOMA',
  unit: 'PIEZA',
  amount: 10,
  minimumAmount: 8,
}
export const CREATED_STORE_RESPONSE_DTO: StoreResponseDto = {
  ...CREATE_STORE_DTO,
  unit: {
    name: units.find(({ name }) => name === CREATE_STORE_DTO.unit)?.name ?? '',
  },
  id: 1,
}

export const CREATE_DELETED_STORE_DTO: CreateStoreDto = {
  name: DELETED_STORE.name,
  unit: '1',
  amount: 17,
  minimumAmount: 12,
}
export const CREATED_DELETED_STORE_DTO: StoreResponseDto = {
  ...CREATE_DELETED_STORE_DTO,
  unit: {
    name:
      units.find(({ id }) => id === +CREATE_DELETED_STORE_DTO.unit)?.name ?? '',
  },
  id: 1,
}

export const UPDATE_STORE_DTO: UpdateStoreDto = {
  amount: 20,
  minimumAmount: STORE.minimumAmount,
}
export const UPDATED_STORE_RESPONSE_DTO: StoreResponseDto = {
  id: STORE.id,
  name: STORE.name,
  unit: { name: units.find(({ id }) => id === STORE.unitId)?.name ?? '' },
  ...UPDATE_STORE_DTO,
}

export const ALL_STORES = machines
  .map(({ code, name }) => ({
    code,
    name,
    stores: stores
      .filter(({ machineCode, deleted }) => machineCode === code && !deleted)
      .map(({ id, name, unitId, amount, minimumAmount }) => ({
        id,
        name,
        unit: { name: units.find(({ id }) => id === unitId)?.name ?? '' },
        amount,
        minimumAmount,
      }))
      .sort(
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
  .filter(({ stores }) => stores.length > 0)
  .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
