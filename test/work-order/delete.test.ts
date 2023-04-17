import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import { WORK_ORDER_ROUTES, workOrders } from './helpers'
import prisma from '../../src/libs/db'
import { FIRST_MACHINE } from '../machine/helpers'

beforeEach(async () => {
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.create({ data: FIRST_MACHINE })
  await prisma.workOrder.createMany({ data: workOrders })
})

describe('Work orders EndPoint => DELETE', () => {
  test('DELETE: invalid id', async () => {
    const { body } = await api
      .delete(WORK_ORDER_ROUTES.delete('invalid'))
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toEqual(
      'El código de la órden de trabajo debe ser un número'
    )
  })
  test('DELETE: work order does not exist', async () => {
    const id = 0
    const { body } = await api
      .delete(WORK_ORDER_ROUTES.delete(id))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toEqual(
      `La órden de trabajo con el código ${id} no existe`
    )
  })
  test('DELETE: work order is finish', async () => {
    const id = 1
    const { body } = await api
      .delete(WORK_ORDER_ROUTES.delete(id))
      .expect('Content-Type', /json/)
      .expect(405)
    expect(body.message).toEqual(
      `No se puede eliminar la órden de trabajo '${id}'`
    )
  })
  test('DELETE: work order', async () => {
    const id = 2
    const { body } = await api
      .delete(WORK_ORDER_ROUTES.delete(id))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body.code).toEqual(id)
  })
})

afterAll(async () => {
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
})
