import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import { ALL_STORES, STORE_ROUTES, stores } from './helpers'
import { api } from '../helpers/api'
import { units } from '../unit/helpers'

describe('Stores EndPoint => GET', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.unit.createMany({ data: units })
    await prisma.store.createMany({ data: stores })
  })

  test('GET: get all stores by machine', async () => {
    const { body } = await api
      .get(STORE_ROUTES.base)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(ALL_STORES)
  })

  afterAll(async () => {
    await prisma.store.deleteMany()
    await prisma.unit.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
