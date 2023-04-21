import { beforeEach, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import { SCHEDULE_ROUTES } from './helpers'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { workOrders } from '../work-order/helpers'
import { CURRENT_DATE } from '../helpers/constants'
import { activities } from '../activity/helpers'

beforeEach(async () => {
  await prisma.activity.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.createMany({ data: machines })
  await prisma.activity.createMany({ data: activities })
  await prisma.workOrder.createMany({ data: workOrders })
})

describe('Schedule EndPoint => GET', () => {
  test('GET: invalid date', async () => {
    const { body } = await api
      .get(SCHEDULE_ROUTES.simple)
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe(
      'La fecha indicada es inválida el formato para la fecha es "MM/DD/YYYY" o "MM/DD/YYYY HH:mm:ss"'
    )
  })
  test('GET: get schedule no strict', async () => {
    const { body } = await api
      .get(SCHEDULE_ROUTES.simple)
      .query({ date: CURRENT_DATE, strict: false })
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toHaveLength(4)
  })
  test('GET: get schedule strict', async () => {
    const { body } = await api
      .get(SCHEDULE_ROUTES.simple)
      .query({ date: CURRENT_DATE })
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toHaveLength(1)
  })
})
