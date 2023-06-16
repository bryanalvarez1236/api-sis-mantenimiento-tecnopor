import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { units } from '../unit/helpers'
import {
  DELETED_STORE_ID,
  STORE_ID,
  STORE_RESPONSE_DTO,
  STORE_ROUTES,
  stores,
} from './helpers'
import { api } from '../helpers/api'
import {
  storeIdValidationErrorMessage,
  storeNotFoundMessage,
} from '../../src/services/store.service'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'

describe('Store EndPoint => DELETE', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.criticality.createMany({ data: criticalities })
    await prisma.technicalDocumentation.createMany({
      data: technicalDocumentation,
    })
    await prisma.machine.createMany({ data: machines })
    await prisma.unit.createMany({ data: units })
    await prisma.store.createMany({ data: stores })
  })

  test('DELETE: invalid id', async () => {
    const { body } = await api
      .delete(STORE_ROUTES.baseWithId(NaN))
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe(storeIdValidationErrorMessage())
  })

  test('DELETE: store does not exist', async () => {
    const storeId = -1
    const { body } = await api
      .delete(STORE_ROUTES.baseWithId(storeId))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(storeNotFoundMessage(storeId))
  })

  test('DELETE: store already deleted', async () => {
    const storeId = DELETED_STORE_ID
    const { body } = await api
      .delete(STORE_ROUTES.baseWithId(storeId))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(storeNotFoundMessage(storeId))
  })

  test('DELETE: store delete', async () => {
    const { body } = await api
      .delete(STORE_ROUTES.baseWithId(STORE_ID))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(STORE_RESPONSE_DTO)
  })

  afterAll(async () => {
    await prisma.store.deleteMany()
    await prisma.unit.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.technicalDocumentation.deleteMany()
    await prisma.criticality.deleteMany()
    await prisma.area.deleteMany()
  })
})
