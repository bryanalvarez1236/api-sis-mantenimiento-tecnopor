import { app } from '../src/index'
import prisma from '../src/libs/db'
import { api } from './helpers/api'
import {
  createdMachine,
  createdMachineImage,
  machineDate,
  machines,
  mockedImage,
  newMachine,
  responseNewMachine,
  CreateMachineDto,
  MACHINE_ENDPOINT,
  responseCreatedMachine,
  updateMachine,
  responseUpdatedMachine,
  machineCodeNotExists,
  machineNotExistsMessage,
} from './helpers/machine.helpers'

jest.mock('../src/libs/cloudinary', () => ({
  __esModules: true,
  uploadMachineImage: jest.fn(async () => Promise.resolve(mockedImage)),
}))

beforeAll(async () => {
  await prisma.machine.create({
    data: {
      ...createdMachine,
      createdAt: machineDate,
      updatedAt: machineDate,
    },
  })
  await prisma.machineImage.create({
    data: { ...createdMachineImage, machineCode: createdMachine.code },
  })
})

describe('Machines EndPoint => GET', () => {
  it('GET: get all machines', async () => {
    const { body } = await api
      .get(MACHINE_ENDPOINT)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toMatchObject(machines)
  })

  it('GET: get a machine by its code', async () => {
    const { body } = await api
      .get(`${MACHINE_ENDPOINT}/${createdMachine.code}`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(body).toMatchObject(responseCreatedMachine)
  })

  it("GET: get a machine that it doesn't exist", async () => {
    const { body } = await api
      .get(`${MACHINE_ENDPOINT}/${machineCodeNotExists}`)
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body

    expect(message).toBe(machineNotExistsMessage)
  })
})

describe('Machines EndPoint => POST', () => {
  it('POST: create a new machine', async () => {
    const request = api
      .post(MACHINE_ENDPOINT)
      .attach('image', 'test/files/test-image.jpg')

    const { technicalDocumentation, ...rest } = newMachine

    const keys = Object.keys(rest) as (keyof Omit<
      CreateMachineDto,
      'technicalDocumentation'
    >)[]

    keys.forEach((key) => {
      request.field(key, rest[key])
    })

    technicalDocumentation.forEach((value) => {
      request.field('technicalDocumentation', value)
    })

    const { body } = await request
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(201)

    responseNewMachine.createdAt = body.createdAt
    responseNewMachine.updatedAt = body.updatedAt

    expect(body).toMatchObject(responseNewMachine)
  })

  it('POST: create a new machine without its fields', async () => {
    const { body } = await api
      .post(MACHINE_ENDPOINT)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)

    const { name } = body
    expect(name).toBe('ZodError')
  })

  it('POST: try to create a new machine that it exists', async () => {
    const { body } = await api
      .post(MACHINE_ENDPOINT)
      .send(createdMachine)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(409)

    const { message } = body
    expect(message).toBe(
      `La máquina con el código '${createdMachine.code}' ya existe`
    )
  })
})

describe('Machines EndPoint => PUT', () => {
  it('PUT: update a machine that it exists', async () => {
    const { body } = await api
      .put(`${MACHINE_ENDPOINT}/${createdMachine.code}`)
      .send(updateMachine)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    responseUpdatedMachine.updatedAt = body.updatedAt

    expect(body).toMatchObject(responseUpdatedMachine)
  })

  it("PUT: update a machine that it doesn't exist", async () => {
    const { body } = await api
      .put(`${MACHINE_ENDPOINT}/${machineCodeNotExists}`)
      .send(updateMachine)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)

    const { message } = body

    expect(message).toBe(machineNotExistsMessage)
  })

  it('PUT: try to update a machine without its fields', async () => {
    const { body } = await api
      .put(`${MACHINE_ENDPOINT}/${createdMachine.code}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)

    const { name } = body

    expect(name).toBe('ZodError')
  })
})

afterEach(() => {
  app.close()
})

afterAll(async () => {
  await prisma.machineImage.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.$disconnect()
  jest.clearAllMocks()
})
