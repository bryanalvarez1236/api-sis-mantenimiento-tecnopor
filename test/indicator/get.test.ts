import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import { activities } from '../activity/helpers'
import { workOrders } from '../work-order/helpers'
import { api } from '../helpers/api'
import { ALL_WORK_ORDERS, DATE_CURRENT, INDICATOR_ROUTES } from './helpers'
import { INVALID_DATE_MESSAGE } from '../../src/libs/date'
import { engines } from '../engine/helpers'

describe('Indicators EndPoint => GET', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.activity.createMany({ data: activities })
    await prisma.engine.createMany({ data: engines })
    await prisma.workOrder.createMany({ data: workOrders })
  })

  test('GET: invalid date', async () => {
    const { body } = await api
      .get(INDICATOR_ROUTES.base)
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe(INVALID_DATE_MESSAGE)
  })

  test.only('GET: all indicators', async () => {
    const { body } = await api
      .get(INDICATOR_ROUTES.baseWithDate(DATE_CURRENT.toISOString()))
      .expect('Content-Type', /json/)
      .expect(200)
    const workOrders = ALL_WORK_ORDERS({ gte: DATE_CURRENT })
    expect(body.workOrders).toEqual(workOrders)
  })

  afterAll(async () => {
    await prisma.workOrder.deleteMany()
    await prisma.engine.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
