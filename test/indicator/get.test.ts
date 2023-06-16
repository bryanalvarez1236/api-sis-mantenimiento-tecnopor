import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { activities } from '../activity/helpers'
import { workOrders } from '../work-order/helpers'
import { api } from '../helpers/api'
import { ALL_WORK_ORDERS, DATE_CURRENT, INDICATOR_ROUTES } from './helpers'
import { INVALID_DATE_MESSAGE } from '../../src/libs/date'
import { engines } from '../engine/helpers'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'
import { activityTypes } from '../activity-type/helpers'
import { frequencies } from '../frequency/helpers'
import { boots } from '../boot/helpers'

describe('Indicators EndPoint => GET', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.criticality.createMany({ data: criticalities })
    await prisma.technicalDocumentation.createMany({
      data: technicalDocumentation,
    })
    await prisma.machine.createMany({ data: machines })
    await prisma.activityType.createMany({ data: activityTypes })
    await prisma.frequency.createMany({ data: frequencies })
    await prisma.activity.createMany({ data: activities })
    await prisma.boot.createMany({ data: boots })
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

  test('GET: all indicators', async () => {
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
    await prisma.boot.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.activityType.deleteMany()
    await prisma.frequency.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.technicalDocumentation.deleteMany()
    await prisma.criticality.deleteMany()
    await prisma.area.deleteMany()
  })
})
