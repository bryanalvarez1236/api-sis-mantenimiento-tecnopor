import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import {
  FIRST_WORK_ORDER_ID,
  SECOND_WORK_ORDER_ID,
  WORK_ORDER_ROUTES,
  workOrders,
} from './helpers'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import { activities } from '../activity/helpers'
import {
  WORK_ORDER_INVALID_ID_MESSAGE,
  workOrderNotDeleteMessage,
  workOrderNotFoundMessage,
} from '../../src/services/workOrder.service'

describe('Work orders EndPoint => DELETE', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.activity.createMany({ data: activities })
    await prisma.workOrder.createMany({ data: workOrders })
  })

  test('DELETE: invalid id', async () => {
    const { body } = await api
      .delete(WORK_ORDER_ROUTES.delete('invalid'))
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe(WORK_ORDER_INVALID_ID_MESSAGE)
  })
  test('DELETE: work order does not exist', async () => {
    const id = 0
    const { body } = await api
      .delete(WORK_ORDER_ROUTES.delete(id))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(workOrderNotFoundMessage(id))
  })
  test('DELETE: work order is finish', async () => {
    const { body } = await api
      .delete(WORK_ORDER_ROUTES.delete(FIRST_WORK_ORDER_ID))
      .expect('Content-Type', /json/)
      .expect(405)
    expect(body.message).toEqual(workOrderNotDeleteMessage(FIRST_WORK_ORDER_ID))
  })
  test('DELETE: work order', async () => {
    const { body } = await api
      .delete(WORK_ORDER_ROUTES.delete(SECOND_WORK_ORDER_ID))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body.code).toEqual(SECOND_WORK_ORDER_ID)
  })

  afterAll(async () => {
    await prisma.workOrder.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
