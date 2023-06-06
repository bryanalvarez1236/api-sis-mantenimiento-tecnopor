import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { api } from '../helpers/api'
import {
  UPDATE_WORK_ORDER,
  WORK_ORDER_CODE_TO_UPDATE,
  WORK_ORDER_ROUTES,
  WORK_ORDER_TO_UPDATE,
} from './helpers'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import {
  WORK_ORDER_INVALID_ID_MESSAGE,
  workOrderNotFoundMessage,
} from '../../src/services/workOrder.service'
import { units } from '../unit/helpers'
import { stores } from '../store/helpers'
import { storeInsufficientAmountMessage } from '../../src/services/store.service'

describe('Work orders EndPoint => PUT', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.workOrder.create({ data: WORK_ORDER_TO_UPDATE })

    await prisma.unit.createMany({ data: units })
    await prisma.store.createMany({ data: stores })
  })

  test('PUT: invalid body', async () => {
    await api
      .put(WORK_ORDER_ROUTES.put(1))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('PUT: invalid id', async () => {
    const { body } = await api
      .put(WORK_ORDER_ROUTES.put('invalid'))
      .set('Accept', 'application/json')
      .send(UPDATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe(WORK_ORDER_INVALID_ID_MESSAGE)
  })
  test('PUT: work order does not exist', async () => {
    const id = -1
    const { body } = await api
      .put(WORK_ORDER_ROUTES.put(id))
      .set('Accept', 'application/json')
      .send(UPDATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(workOrderNotFoundMessage(id))
  })

  test('PUT: stores invalid', async () => {
    const store = { name: 'ANILLO DE GOMA', amount: 25 }
    const { body } = await api
      .put(WORK_ORDER_ROUTES.put(WORK_ORDER_CODE_TO_UPDATE))
      .set('Accept', 'application/json')
      .send({ ...UPDATE_WORK_ORDER, stores: [store] })
      .expect('Content-Type', /json/)
      .expect(406)
    expect(body.message).toEqual(storeInsufficientAmountMessage(store.name))
  })

  test('PUT: update a work order', async () => {
    await api
      .put(WORK_ORDER_ROUTES.put(WORK_ORDER_CODE_TO_UPDATE))
      .set('Accept', 'application/json')
      .send(UPDATE_WORK_ORDER)
      .expect('Content-Type', /json/)
      .expect(200)
  })

  afterAll(async () => {
    await prisma.storeWorkOrder.deleteMany()
    await prisma.store.deleteMany()
    await prisma.unit.deleteMany()

    await prisma.workOrder.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
