import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import {
  CURRENT_WORK_ORDER,
  UPDATED_WORK_ORDER_RESPONSE,
  UPDATE_WORK_ORDER,
  WORK_ORDER_ROUTES,
} from './helpers'
import prisma from '../../src/libs/db'
import { FIRST_MACHINE } from '../machine/helpers'

beforeEach(async () => {
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.create({ data: FIRST_MACHINE })
  await prisma.workOrder.create({ data: CURRENT_WORK_ORDER })
})

describe('Work orders EndPoint => PUT', () => {
  test('PUT: invalid body', async () => {
    await api
      .put(WORK_ORDER_ROUTES.put(1))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('PUT: invalid id', async () => {
    const { body } = await api
      .put(WORK_ORDER_ROUTES.put('invalid'))
      .set('Accept', 'application/json')
      .send(UPDATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toEqual(
      'El código de la órden de trabajo debe ser un número'
    )
  })
  test('PUT: work order does not exist', async () => {
    const id = 10000
    const { body } = await api
      .put(WORK_ORDER_ROUTES.put(id))
      .set('Accept', 'application/json')
      .send(UPDATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toEqual(
      `La órden de trabajo con el código ${id} no existe`
    )
  })
  test('PUT: update a work order', async () => {
    const { body } = await api
      .put(WORK_ORDER_ROUTES.put(3))
      .set('Accept', 'application/json')
      .send(UPDATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual({
      ...UPDATED_WORK_ORDER_RESPONSE,
      updatedAt: body.updatedAt,
    })
  })
})

afterAll(async () => {
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
})
