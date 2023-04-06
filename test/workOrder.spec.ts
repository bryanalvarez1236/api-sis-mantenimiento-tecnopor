import { app } from '../src'
import prisma from '../src/libs/db'
import {
  activityCodeNotExists,
  activityNotExistsMessage,
  createdActivity,
} from './helpers/activity.helpers'
import { api } from './helpers/api'
import {
  createdEngine,
  engineCodeNotExists,
  engineNotExistsMessage,
} from './helpers/engine.helpers'
import { createdMachine } from './helpers/machine.helpers'
import {
  createdWorkOrders,
  newWorkOrder,
  newWorkOrderWithActivityExists,
  responseNewWorkOrder,
  responseNewWorkOrderWithActivityExists,
  responseUpdateWorkOrder,
  responseWorkOrdersMoth,
  responseWorkOrdersWeek,
  responseWorkOrdersYear,
  responseWorkOrderWeek,
  updateWorkOrder,
  workOrderDate,
  workOrderInvalidActivity,
  WorkOrderResponseDto,
  WORK_ORDER_ENDPOINT,
  WORK_ORDER_ID_NOT_EXISTS,
  WORK_ORDER_INVALID_ACTIVITY,
  WORK_ORDER_INVALID_ID,
  WORK_ORDER_INVALID_NEXT_STATE_MESSAGE,
  WORK_ORDER_NOT_EXISTS_MESSAGE,
} from './helpers/workOrder.helpers'

jest.mock('../src/libs/date', () => ({
  __esModules: true,
  getDateBoliviaTimeZone: jest.fn(() => workOrderDate),
}))

beforeAll(async () => {
  await prisma.machine.create({ data: createdMachine })
  await prisma.engine.create({
    data: { ...createdEngine, machineCode: createdMachine.code },
  })
  await prisma.activity.create({
    data: { ...createdActivity },
  })
  const { code: machineCode } = createdMachine
  for (const [index, { date, workOrder }] of createdWorkOrders.entries()) {
    const {
      engineCode,
      activity: { activityType, name: activityName },
    } = workOrder
    const { code: activityCode } = await prisma.activity.create({
      data: {
        machineCode,
        activityType: activityType ?? 'CORRECTIVE_MAINTENANCE',
        name: activityName as string,
      },
    })
    await prisma.workOrder.create({
      data: {
        id: index + 1,
        engineCode,
        activityCode,
        createdAt: date,
        updatedAt: date,
      },
    })
  }
})

describe('Work Orders EndPoint => GET', () => {
  it('GET: get work orders this week', async () => {
    const { body } = await api
      .get(`${WORK_ORDER_ENDPOINT}?dateRange=WEEKLY`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body.length).toBe(responseWorkOrdersWeek.length)

    const expectResult = body.map(
      ({ id, activityCode }: WorkOrderResponseDto, index: number) => ({
        ...responseWorkOrdersWeek[index],
        id,
        activityCode,
      })
    )
    expect(body).toMatchObject(expectResult)
  })
  it('GET: get work orders this month', async () => {
    const { body } = await api
      .get(`${WORK_ORDER_ENDPOINT}?dateRange=MONTHLY`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body.length).toBe(responseWorkOrdersMoth.length)

    const expectResult = body.map(
      ({ id, activityCode }: WorkOrderResponseDto, index: number) => ({
        ...responseWorkOrdersMoth[index],
        id,
        activityCode,
      })
    )
    expect(body).toMatchObject(expectResult)
  })
  it('GET: get work orders this year', async () => {
    const { body } = await api
      .get(`${WORK_ORDER_ENDPOINT}?dateRange=ANNUAL`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body.length).toBe(responseWorkOrdersYear.length)

    const expectResult = body.map(
      ({ id, activityCode }: WorkOrderResponseDto, index: number) => ({
        ...responseWorkOrdersYear[index],
        id,
        activityCode,
      })
    )
    expect(body).toMatchObject(expectResult)
  })
  it('GET: get a work order by its id', async () => {
    const { body } = await api
      .get(`${WORK_ORDER_ENDPOINT}/1`)
      .expect('Content-Type', /json/)
      .expect(200)

    const { activityCode } = body
    expect(body).toMatchObject({ ...responseWorkOrderWeek, activityCode })
  })
  it('GET: get a work order with string id', async () => {
    const { body } = await api
      .get(`${WORK_ORDER_ENDPOINT}/one`)
      .expect('Content-Type', /json/)
      .expect(400)

    const { message } = body
    expect(message).toBe(WORK_ORDER_INVALID_ID)
  })
  it("GET: get a work order doesn't exist", async () => {
    const { body } = await api
      .get(`${WORK_ORDER_ENDPOINT}/${WORK_ORDER_ID_NOT_EXISTS}`)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(WORK_ORDER_NOT_EXISTS_MESSAGE)
  })
})

describe('Work Orders EndPoint => POST', () => {
  it('POST: create a new work order', async () => {
    const { body } = await api
      .post(WORK_ORDER_ENDPOINT)
      .set('Accept', 'application/json')
      .send(newWorkOrder)
      .expect('Content-Type', /json/)
      .expect(201)

    responseNewWorkOrder.id = body.id
    responseNewWorkOrder.activityCode = body.activityCode
    responseNewWorkOrder.createdAt = body.createdAt
    responseNewWorkOrder.updatedAt = body.updatedAt
    expect(body).toMatchObject(responseNewWorkOrder)
  })
  it('POST: create a new work order with activity exists', async () => {
    const { body } = await api
      .post(WORK_ORDER_ENDPOINT)
      .set('Accept', 'application/json')
      .send(newWorkOrderWithActivityExists)
      .expect('Content-Type', /json/)
      .expect(201)

    responseNewWorkOrderWithActivityExists.id = body.id
    responseNewWorkOrderWithActivityExists.createdAt = body.createdAt
    responseNewWorkOrderWithActivityExists.updatedAt = body.updatedAt
    expect(body).toMatchObject(responseNewWorkOrderWithActivityExists)
  })
  it("POST: create a work order with an engine doesn't exist", async () => {
    const { body } = await api
      .post(WORK_ORDER_ENDPOINT)
      .set('Accept', 'application/json')
      .send({ ...newWorkOrder, engineCode: engineCodeNotExists })
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(engineNotExistsMessage)
  })
  it("POST: create a work order with an activity doesn't exist", async () => {
    const { body } = await api
      .post(WORK_ORDER_ENDPOINT)
      .set('Accept', 'application/json')
      .send({
        ...newWorkOrder,
        activity: { ...newWorkOrder.activity, code: activityCodeNotExists },
      })
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(activityNotExistsMessage)
  })
  it('POST: create a work order without fields activity', async () => {
    const { body } = await api
      .post(WORK_ORDER_ENDPOINT)
      .set('Accept', 'application/json')
      .send(workOrderInvalidActivity)
      .expect('Content-Type', /json/)
      .expect(400)

    const { message } = body
    expect(message).toBe(WORK_ORDER_INVALID_ACTIVITY)
  })
})

describe('Work Orders EndPoint => PUT', () => {
  it('PUT: update a work order by its id', async () => {
    const { body } = await api
      .put(`${WORK_ORDER_ENDPOINT}/${responseWorkOrderWeek.id}`)
      .set('Accept', 'application/json')
      .send(updateWorkOrder)
      .expect('Content-Type', /json/)
      .expect(200)

    const { activityCode, updatedAt } = body
    expect(body).toMatchObject({
      ...responseUpdateWorkOrder,
      activityCode,
      updatedAt,
    })
  })
  it("PUT: update a work doesn't exist", async () => {
    const { body } = await api
      .put(`${WORK_ORDER_ENDPOINT}/${WORK_ORDER_ID_NOT_EXISTS}`)
      .set('Accept', 'application/json')
      .send(updateWorkOrder)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(WORK_ORDER_NOT_EXISTS_MESSAGE)
  })
  it('PUT: update a work with invalid next state', async () => {
    const { body } = await api
      .put(`${WORK_ORDER_ENDPOINT}/${responseWorkOrderWeek.id}`)
      .set('Accept', 'application/json')
      .send({ ...updateWorkOrder, state: 'DONE' })
      .expect('Content-Type', /json/)
      .expect(400)

    const { message } = body
    expect(message).toBe(WORK_ORDER_INVALID_NEXT_STATE_MESSAGE)
  })
})

afterEach(() => {
  app.close()
})

afterAll(async () => {
  await prisma.workOrder.deleteMany()
  await prisma.engine.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.$disconnect()
  jest.clearAllMocks()
})
