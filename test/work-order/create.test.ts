import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import {
  CREATED_WORK_ORDER_RESPONSE,
  CREATE_WORK_ORDER,
  WORK_ORDER_ROUTES,
} from './helpers'
import prisma from '../../src/libs/db'
import { FIRST_MACHINE } from '../machine/helpers'

beforeEach(async () => {
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.create({ data: FIRST_MACHINE })
})

describe('Work orders EndPoint => POST', () => {
  test('POST: invalid body', async () => {
    await api
      .post(WORK_ORDER_ROUTES.post)
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('POST: create a new order with a activity does not exist', async () => {
    await api
      .post(WORK_ORDER_ROUTES.post)
      .set('Accept', 'application/json')
      .send({ ...CREATE_WORK_ORDER, activityCode: 'NOT000' })
      .expect('Content-Type', /json/)
      .expect(404)
  })
  test('POST: create a new order with a engine does not exist', async () => {
    await api
      .post(WORK_ORDER_ROUTES.post)
      .set('Accept', 'application/json')
      .send({ ...CREATE_WORK_ORDER, engineCode: 'LL-00-LLL-00-MOT-000' })
      .expect('Content-Type', /json/)
      .expect(404)
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
})

afterAll(async () => {
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
})
