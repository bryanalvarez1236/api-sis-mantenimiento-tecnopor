import { describe, expect, beforeEach, test } from 'vitest'
import { api } from '../helpers/api'
import prisma from '../../src/libs/db'
import { FIRST_MACHINE } from '../machine/helpers'
import {
  FIRST_WORK_ORDER_RESPONSE,
  MIDDLE_DATE_MONTH,
  WORK_ORDER_ROUTES,
  allWorkOrders,
  workOrders,
} from './helpers'

beforeEach(async () => {
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.create({ data: FIRST_MACHINE })
  await prisma.workOrder.createMany({ data: workOrders })
})

describe('Work orders EndPoint => GET', () => {
  test('GET: invalid date', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getAll)
      .expect('Content-Type', /json/)
      .expect(400)

    expect(body.message).toBe('La fecha indicada es inválida')
  })
  test('GET: get work orders', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getAll)
      .query({ date: MIDDLE_DATE_MONTH.toLocaleDateString('en-US') })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toHaveLength(2)
    expect(body).toEqual(allWorkOrders)
  })
  test('GET: get a work order by id invalid', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getById('invalid'))
      .expect('Content-Type', /json/)
      .expect(400)

    expect(body.message).toBe(
      'El código de la órden de trabajo debe ser un número'
    )
  })
  test('GET: get a work order does not exist', async () => {
    const id = 100000
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getById(id))
      .expect('Content-Type', /json/)
      .expect(404)

    expect(body.message).toBe(
      `La órden de trabajo con el código ${id} no existe`
    )
  })
  test('GET: get a work order by id', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.getById(1))
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toEqual(FIRST_WORK_ORDER_RESPONSE)
  })
  test('GET: count is correct', async () => {
    const { body } = await api
      .get(WORK_ORDER_ROUTES.count)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body.count).toEqual(workOrders.length + 1)
  })
})
