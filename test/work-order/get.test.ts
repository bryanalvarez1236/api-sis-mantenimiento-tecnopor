import { describe, expect, test, beforeAll, afterAll } from 'vitest'
import { api } from '../helpers/api'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { WORK_ORDER_ROUTES, workOrders } from './helpers'
import { activities } from '../activity/helpers'
import { INVALID_DATE_MESSAGE } from '../../src/libs/date'
import {
  WORK_ORDER_INVALID_ID_MESSAGE,
  workOrderNotFoundMessage,
} from '../../src/services/workOrder.service'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'
import { activityTypes } from '../activity-type/helpers'
import { frequencies } from '../frequency/helpers'
import { boots } from '../boot/helpers'
import { engines } from '../engine/helpers'

describe('Work orders EndPoint => GET', () => {
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
      .get(WORK_ORDER_ROUTES.getAll)
      .expect('Content-Type', /json/)
      .expect(400)

    expect(body.message).toBe(INVALID_DATE_MESSAGE)
  })
  test('GET: get work orders', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getAll)
      .query({ date: '2022-07-06' })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toHaveLength(36)
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
    await api
      .get(WORK_ORDER_ROUTES.getById(954))
      .expect('Content-Type', /json/)
      .expect(200)
  })
  test('GET: count is correct', async () => {
    await api
      .get(WORK_ORDER_ROUTES.count)
      .expect('Content-Type', /json/)
      .expect(200)
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
