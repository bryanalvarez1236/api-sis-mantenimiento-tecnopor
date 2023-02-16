import { ZodError } from 'zod'
import { app } from '../src'
import prisma from '../src/libs/db'
import { api } from './helpers/api'
import {
  createdEngine,
  createdMachineWithEngines,
  engineCodeNotExists,
  engineDate,
  engineNotExistsMessage,
  ENGINE_ENDPOINT,
  newEngine,
  responseNewEngine,
  responseUpdatedEngine,
  updateEngine,
} from './helpers/engine.helpers'
import {
  createdMachine,
  machineCodeNotExists,
  machineDate,
  machineNotExistsMessage,
} from './helpers/machine.helpers'

beforeAll(async () => {
  await prisma.machine.create({
    data: {
      ...createdMachine,
      createdAt: machineDate,
      updatedAt: machineDate,
    },
  })
  await prisma.engine.create({
    data: {
      ...createdEngine,
      createdAt: engineDate,
      updatedAt: engineDate,
      machineCode: createdMachine.code,
    },
  })
})

describe('Engines EndPoint => GET', () => {
  it('GET: get engines of a machine', async () => {
    const { body } = await api
      .get(`${ENGINE_ENDPOINT(createdMachine.code)}`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toMatchObject({ ...createdMachineWithEngines, image: null })
  })

  it("GET: get engines of a machine doesn't exist", async () => {
    const { body } = await api
      .get(`${ENGINE_ENDPOINT(machineCodeNotExists)}`)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(machineNotExistsMessage)
  })

  it('GET: get a engine by code', async () => {
    const { body } = await api
      .get(`${ENGINE_ENDPOINT(createdMachine.code)}/${createdEngine.code}`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toMatchObject(createdEngine)
  })

  it("GET: get a engine doesn't exist", async () => {
    const { body } = await api
      .get(`${ENGINE_ENDPOINT(createdMachine.code)}/${engineCodeNotExists}`)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body

    expect(message).toBe(engineNotExistsMessage)
  })
})

describe('Engines EndPoint => POST', () => {
  it('POST: create a engine to a machine', async () => {
    const { body } = await api
      .post(`${ENGINE_ENDPOINT(createdMachine.code)}`)
      .set('Accept', 'application/json')
      .send(newEngine)
      .expect('Content-Type', /json/)
      .expect(201)

    const { createdAt, updatedAt } = body

    expect(body).toMatchObject({ ...responseNewEngine, createdAt, updatedAt })
  })

  it("POST: create a engine to a machine doesn't exist", async () => {
    const { body } = await api
      .post(`${ENGINE_ENDPOINT(machineCodeNotExists)}`)
      .set('Accept', 'application/json')
      .send(newEngine)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(machineNotExistsMessage)
  })

  it('POST: try to create a engine without its fields', async () => {
    const { body } = await api
      .post(`${ENGINE_ENDPOINT(createdMachine.code)}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)

    const { name } = body
    expect(name).toBe(ZodError.name)
  })
})

describe('Engines EndPoint => PUT', () => {
  it('PUT: update a engine by its code', async () => {
    const { body } = await api
      .put(`${ENGINE_ENDPOINT(createdMachine.code)}/${createdEngine.code}`)
      .set('Accept', 'application/json')
      .send(updateEngine)
      .expect('Content-Type', /json/)
      .expect(200)

    const { updatedAt } = body
    expect(body).toMatchObject({ ...responseUpdatedEngine, updatedAt })
  })

  it("PUT: update a engine doesn't exist", async () => {
    const { body } = await api
      .put(`${ENGINE_ENDPOINT(createdMachine.code)}/${engineCodeNotExists}`)
      .set('Accept', 'application/json')
      .send(updateEngine)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body
    expect(message).toBe(engineNotExistsMessage)
  })

  it('PUT: try to update a engine without its fields', async () => {
    const { body } = await api
      .put(`${ENGINE_ENDPOINT(createdMachine.code)}/${createdEngine.code}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)

    const { name } = body
    expect(name).toBe(ZodError.name)
  })
})

afterEach(() => {
  app.close()
})

afterAll(async () => {
  await prisma.engine.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.$disconnect()
})
