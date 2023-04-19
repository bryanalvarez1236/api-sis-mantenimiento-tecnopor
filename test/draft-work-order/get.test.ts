import { beforeEach, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import {
  CURRENT_DATE,
  DRAFT_WORK_ORDERS_ROUTES,
  draftWorkOrders,
} from './helpers'
import prisma from '../../src/libs/db'
import { FIRST_MACHINE } from '../machine/helpers'
import { workOrders } from '../work-order/helpers'
import { activities } from '../activity/helpers'

beforeEach(async () => {
  await prisma.activity.deleteMany()
  await prisma.draftWorkOrder.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.create({ data: FIRST_MACHINE })
  await prisma.activity.createMany({ data: activities })
  await prisma.workOrder.createMany({ data: workOrders })
  await prisma.draftWorkOrder.createMany({ data: draftWorkOrders })
})

describe('Draft work orders EndPoint => GET', async () => {
  test('GET: invalid date', async () => {
    const { body } = await api
      .get(DRAFT_WORK_ORDERS_ROUTES.simple)
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe(
      'La fecha indicada es inválida el formato para la fecha es "MM/DD/YYYY" o "MM/DD/YYYY HH:mm:ss"'
    )
  })
  test('GET: draft work orders by a date', async () => {
    const { body } = await api
      .get(DRAFT_WORK_ORDERS_ROUTES.simple)
      .query({ date: CURRENT_DATE })
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toHaveLength(3)
  })
})
