import { ZodError } from 'zod'
import { app } from '../src'
import prisma from '../src/libs/db'
import {
  activities,
  activityAlreadyExists,
  activityCodeNotExists,
  activityDate,
  activityNotExistsMessage,
  ACTIVITY_ENDPOINT,
  createdActivity,
  newActivity,
  responseCreatedActivity,
  responseNewActivity,
  responseUpdateActivity,
  updateActivity,
} from './helpers/activity.helpers'
import { api } from './helpers/api'
import {
  createdMachine,
  machineCodeNotExists,
  machineNotExistsMessage,
} from './helpers/machine.helpers'

beforeAll(async () => {
  await prisma.machine.create({ data: createdMachine })
  await prisma.activity.create({
    data: {
      ...createdActivity,
      createdAt: activityDate,
      updatedAt: activityDate,
    },
  })
})

describe('Activities EndPoint => GET', () => {
  it('GET: get all activities of a machine by its code', async () => {
    const { body } = await api
      .get(`${ACTIVITY_ENDPOINT}?machineCode=${createdMachine.code}`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toMatchObject(activities)
  })

  it("GET: get all activities of a machine that it doesn't exist", async () => {
    const { body } = await api
      .get(`${ACTIVITY_ENDPOINT}?machineCode=${machineCodeNotExists}`)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(machineNotExistsMessage)
  })

  it('GET: get an activity of a machine by its code', async () => {
    const { body } = await api
      .get(
        `${ACTIVITY_ENDPOINT}/${createdActivity.code}?machineCode=${createdMachine.code}`
      )
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toMatchObject(responseCreatedActivity)
  })

  it("GET: get an activity that it doesn't exist", async () => {
    const { body } = await api
      .get(
        `${ACTIVITY_ENDPOINT}/${activityCodeNotExists}?machineCode=${createdMachine.code}`
      )
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(activityNotExistsMessage)
  })
})

describe('Activities EndPoint => POST', () => {
  it('POST: create a new activity', async () => {
    const { body } = await api
      .post(`${ACTIVITY_ENDPOINT}`)
      .set('Accept', 'application/json')
      .send(newActivity)
      .expect('Content-Type', /json/)
      .expect(201)

    responseNewActivity.createdAt = body.createdAt
    responseNewActivity.updatedAt = body.updatedAt
    expect(body).toMatchObject(responseNewActivity)
  })

  it('POST: create an activity that it exists', async () => {
    const { body } = await api
      .post(`${ACTIVITY_ENDPOINT}`)
      .set('Accept', 'application/json')
      .send(createdActivity)
      .expect('Content-Type', /json/)
      .expect(409)

    const { message } = body
    expect(message).toBe(activityAlreadyExists)
  })

  it("POST: create an activity that a machine doesn't exist", async () => {
    const { body } = await api
      .post(`${ACTIVITY_ENDPOINT}`)
      .set('Accept', 'application/json')
      .send({ ...newActivity, machineCode: machineCodeNotExists })
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(machineNotExistsMessage)
  })

  it('POST: try to create an activity without its fields', async () => {
    const { body } = await api
      .post(`${ACTIVITY_ENDPOINT}`)
      .expect('Content-Type', /json/)
      .expect(400)

    const { name } = body
    expect(name).toBe(ZodError.name)
  })
})

describe('Activities EndPoint => PUT', () => {
  it('PUT: update an activity by its code', async () => {
    const { body } = await api
      .put(`${ACTIVITY_ENDPOINT}/${createdActivity.code}`)
      .set('Accept', 'application/json')
      .send(updateActivity)
      .expect('Content-Type', /json/)
      .expect(200)

    responseUpdateActivity.updatedAt = body.updatedAt
    expect(body).toMatchObject(responseUpdateActivity)
  })

  it("PUT: update an activity that it doesn't exist", async () => {
    const { body } = await api
      .put(`${ACTIVITY_ENDPOINT}/${activityCodeNotExists}`)
      .set('Accept', 'application/json')
      .send(updateActivity)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(activityNotExistsMessage)
  })

  it('PUT: try to update an activity without its fields', async () => {
    const { body } = await api
      .put(`${ACTIVITY_ENDPOINT}/${createdActivity.code}`)
      .expect('Content-Type', /json/)
      .expect(400)

    const { name } = body
    expect(name).toBe(ZodError.name)
  })
})

describe('Activities EndPoint => DELETE', () => {
  it('DELETE: delete an activity by its code', async () => {
    const { body } = await api
      .delete(
        `${ACTIVITY_ENDPOINT}/${newActivity.code}?machineCode=${createdMachine.code}`
      )
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toMatchObject({ code: newActivity.code })
  })

  it("DELETE: delete an activity that it doesn't exist", async () => {
    const { body } = await api
      .delete(
        `${ACTIVITY_ENDPOINT}/${activityCodeNotExists}?machineCode=${createdMachine.code}`
      )
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(activityNotExistsMessage)
  })
})

afterEach(() => {
  app.close()
})

afterAll(async () => {
  await prisma.activity.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.$disconnect()
})
