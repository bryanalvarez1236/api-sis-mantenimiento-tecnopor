import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import {
  SECOND_WORK_ORDER_ID,
  UPDATED_WORK_ORDER_RESPONSE,
  UPDATE_WORK_ORDER,
  WORK_ORDER_ROUTES,
  workOrders,
} from './helpers'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import { activities } from '../activity/helpers'
import {
  WORK_ORDER_INVALID_ID_MESSAGE,
  workOrderNotFoundMessage,
} from '../../src/services/workOrder.service'

describe('Work orders EndPoint => PUT', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.activity.createMany({ data: activities })
    await prisma.workOrder.createMany({ data: workOrders })
  })

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
    expect(body.message).toBe(WORK_ORDER_INVALID_ID_MESSAGE)
  })
  test('PUT: work order does not exist', async () => {
    const id = 0
    const { body } = await api
      .put(WORK_ORDER_ROUTES.put(id))
      .set('Accept', 'application/json')
      .send(UPDATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(workOrderNotFoundMessage(id))
  })
  test('PUT: update a work order', async () => {
    const { body } = await api
      .put(WORK_ORDER_ROUTES.put(SECOND_WORK_ORDER_ID))
      .set('Accept', 'application/json')
      .send(UPDATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual({
      ...UPDATED_WORK_ORDER_RESPONSE,
      updatedAt: body.updatedAt,
    })
  })

  afterAll(async () => {
    await prisma.workOrder.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
