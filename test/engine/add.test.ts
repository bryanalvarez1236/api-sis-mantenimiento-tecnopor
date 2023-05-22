import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { FIRST_MACHINE_CODE, areas, machines } from '../machine/helpers'
import {
  CREATED_ENGINE_RESPONSE_DTO,
  CREATE_ENGINE_DTO,
  ENGINE_ROUTES,
  FIRST_ENGINE_CODE,
  engines,
} from './helpers'
import { api } from '../helpers/api'
import { engineAlreadyExistsMessage } from '../../src/services/engine.service'
import { machineNotFoundMessage } from '../../src/services/machine.service'

describe('Engines EndPoint => POST', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.engine.createMany({ data: engines })
  })

  test('POST: invalid body', async () => {
    await api
      .post(ENGINE_ROUTES.baseWithMachine(FIRST_MACHINE_CODE))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('POST: machine does not exist', async () => {
    const machineCode = 'CB-00-MAQ-00'
    const { body } = await api
      .post(ENGINE_ROUTES.baseWithMachine(machineCode))
      .set('Accept', 'application/json')
      .send(CREATE_ENGINE_DTO)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(machineCode))
  })
  test('POST: engine already exists', async () => {
    const { body } = await api
      .post(ENGINE_ROUTES.baseWithMachine(FIRST_MACHINE_CODE))
      .set('Accept', 'application/json')
      .send({ ...CREATE_ENGINE_DTO, code: FIRST_ENGINE_CODE })
      .expect('Content-Type', /json/)
      .expect(409)
    expect(body.message).toBe(engineAlreadyExistsMessage(FIRST_ENGINE_CODE))
  })
  test('POST: add a new engine', async () => {
    const { body } = await api
      .post(ENGINE_ROUTES.baseWithMachine(FIRST_MACHINE_CODE))
      .set('Accept', 'application/json')
      .send(CREATE_ENGINE_DTO)
      .expect('Content-Type', /json/)
      .expect(201)
    expect(body).toEqual(CREATED_ENGINE_RESPONSE_DTO)
  })

  afterAll(async () => {
    await prisma.engine.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
