import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import {
  CREATED_WORK_ORDER_RESPONSE,
  CREATE_WORK_ORDER,
  WORK_ORDER_ROUTES,
  workOrders,
} from './helpers'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import { activities } from '../activity/helpers'
import { activityNotFoundMessage } from '../../src/services/activity.service'
import { engineNotFoundMessage } from '../../src/services/engine.service'

describe('Work orders EndPoint => POST', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.activity.createMany({ data: activities })
    await prisma.workOrder.createMany({ data: workOrders })
  })

  test('POST: invalid body', async () => {
    await api
      .post(WORK_ORDER_ROUTES.post)
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('POST: create a new order with a activity does not exist', async () => {
    const activityCode = 'PRX000'
    const { body } = await api
      .post(WORK_ORDER_ROUTES.post)
      .set('Accept', 'application/json')
      .send({ ...CREATE_WORK_ORDER, activityCode })
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(activityNotFoundMessage(activityCode))
  })
  test('POST: create a new order with a engine does not exist', async () => {
    const engineCode = 'CB-00-PRX-00-MOT-000'
    const { body } = await api
      .post(WORK_ORDER_ROUTES.post)
      .set('Accept', 'application/json')
      .send({ ...CREATE_WORK_ORDER, engineCode })
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(engineNotFoundMessage(engineCode))
  })
  test('POST: create a new work order', async () => {
    const { body } = await api
      .post(WORK_ORDER_ROUTES.post)
      .set('Accept', 'application/json')
      .send(CREATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(201)
    expect(body).toEqual({ ...CREATED_WORK_ORDER_RESPONSE, code: body.code })
  })

  afterAll(async () => {
    await prisma.workOrder.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
