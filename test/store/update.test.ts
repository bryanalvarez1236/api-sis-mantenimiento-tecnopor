import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import {
  DELETED_STORE_ID,
  STORE_ID,
  STORE_ROUTES,
  UPDATED_STORE_RESPONSE_DTO,
  UPDATE_STORE_DTO,
  stores,
} from './helpers'
import { api } from '../helpers/api'
import { storeNotFoundMessage } from '../../src/services/store.service'
import { units } from '../unit/helpers'

describe('Store Endpoint => PUT', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.unit.createMany({ data: units })
    await prisma.store.createMany({ data: stores })
  })

  test('PUT: invalid body', async () => {
    await api
      .put(STORE_ROUTES.baseWithId(STORE_ID))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })

  test('PUT: store does not exist', async () => {
    const id = 0
    const { body } = await api
      .put(STORE_ROUTES.baseWithId(id))
      .set('Accept', 'application/json')
      .send(UPDATE_STORE_DTO)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(storeNotFoundMessage(id))
  })

  test('PUT: store does not exist because it was deleted', async () => {
    const id = DELETED_STORE_ID
    const { body } = await api
      .put(STORE_ROUTES.baseWithId(id))
      .set('Accept', 'application/json')
      .send(UPDATE_STORE_DTO)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(storeNotFoundMessage(id))
  })

  test('PUT: update a store by its id', async () => {
    const { body } = await api
      .put(STORE_ROUTES.baseWithId(STORE_ID))
      .set('Accept', 'application/json')
      .send(UPDATE_STORE_DTO)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(UPDATED_STORE_RESPONSE_DTO)
  })

  afterAll(async () => {
    await prisma.store.deleteMany()
    await prisma.unit.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
