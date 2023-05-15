import { describe, expect, test, beforeAll, afterAll } from 'vitest'
import { api } from '../helpers/api'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import {
  ALL_WORK_ORDERS,
  FIRST_WORK_ORDER_RESPONSE,
  MIDDLE_DATE_MONTH,
  WORK_ORDER_ROUTES,
  workOrders,
} from './helpers'
import { activities } from '../activity/helpers'
import { INVALID_DATE_MESSAGE } from '../../src/libs/date'
import {
  WORK_ORDER_INVALID_ID_MESSAGE,
  workOrderNotFoundMessage,
} from '../../src/services/workOrder.service'

describe('Work orders EndPoint => GET', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.activity.createMany({ data: activities })
    await prisma.workOrder.createMany({ data: workOrders })
  })

  test('GET: invalid date', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getAll)
      .expect('Content-Type', /json/)
      .expect(400)

    expect(body.message).toBe(INVALID_DATE_MESSAGE)
  })
  test('GET: get work orders', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getAll)
      .query({ date: MIDDLE_DATE_MONTH.toLocaleDateString('en-US') })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toHaveLength(4)
    expect(body).toEqual(ALL_WORK_ORDERS)
  })
  test('GET: get a work order by id invalid', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getById('invalid'))
      .expect('Content-Type', /json/)
      .expect(400)

    expect(body.message).toBe(WORK_ORDER_INVALID_ID_MESSAGE)
  })
  test('GET: get a work order does not exist', async () => {
    const id = 100000
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getById(id))
      .expect('Content-Type', /json/)
      .expect(404)

    expect(body.message).toBe(workOrderNotFoundMessage(id))
  })
  test('GET: get a work order by id', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getById(1))
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toEqual(FIRST_WORK_ORDER_RESPONSE)
  })
  test('GET: count is correct', async () => {
    await api
      .get(WORK_ORDER_ROUTES.count)
      .expect('Content-Type', /json/)
      .expect(200)
    // validate body.machines
  })

  afterAll(async () => {
    await prisma.workOrder.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
