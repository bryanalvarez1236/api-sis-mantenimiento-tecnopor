import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import { workOrders } from '../work-order/helpers'
import { engines } from '../engine/helpers'
import { activities } from '../activity/helpers'
import { api } from '../helpers/api'
import {
  DATE,
  HISTORICAL,
  HISTORICAL_ROUTES,
  HISTORICAL_SUMMARY,
  MACHINE_CODE,
  MACHINE_NAME,
} from './helpers'
import { machineNotFoundMessage } from '../../src/services/machine.service'
import { INVALID_DATE_MESSAGE } from '../../src/libs/date'

describe('Historical EndPoint => GET', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.engine.createMany({ data: engines })
    await prisma.activity.createMany({ data: activities })
    await prisma.workOrder.createMany({ data: workOrders })
  })

  test('GET: invalid lte param', async () => {
    const { body } = await api
      .get(HISTORICAL_ROUTES.baseWithMachineCode(MACHINE_CODE))
      .query({ lte: 'INVALID DATE' })
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe(INVALID_DATE_MESSAGE)
  })

  test('GET: machine does not exist', async () => {
    const machineCode = 'CB-00-MAQ-00'
    const { body } = await api
      .get(HISTORICAL_ROUTES.baseWithMachineCode(machineCode))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(machineCode))
  })

  test('GET: get historical summary', async () => {
    const { body } = await api
      .get(HISTORICAL_ROUTES.baseSummaryWithMachineCode(MACHINE_CODE))
      .query({ lte: DATE.toISOString() })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body.length).toBeLessThanOrEqual(10)
    expect(body).toEqual(HISTORICAL_SUMMARY)
  })

  test('GET: get historical', async () => {
    const { body } = await api
      .get(HISTORICAL_ROUTES.baseWithMachineCode(MACHINE_CODE))
      .query({ lte: DATE.toISOString() })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toEqual({
      code: MACHINE_CODE,
      name: MACHINE_NAME,
      workOrders: HISTORICAL,
    })
  })

  afterAll(async () => {
    await prisma.workOrder.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.engine.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
