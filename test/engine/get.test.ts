import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { FIRST_MACHINE_CODE, areas, machines } from '../machine/helpers'
import {
  ALL_ENGINES,
  ENGINE_ROUTES,
  FIRST_ENGINE,
  FIRST_ENGINE_CODE,
  engines,
} from './helpers'
import { api } from '../helpers/api'
import { engineNotFoundMessage } from '../../src/services/engine.service'
import { machineNotFoundMessage } from '../../src/services/machine.service'

beforeAll(async () => {
  await prisma.area.createMany({ data: areas })
  await prisma.machine.createMany({ data: machines })
  await prisma.engine.createMany({ data: engines })
})

describe('Engines EndPoint => GET all machine engines', () => {
  test('GET: machine does not exist', async () => {
    const machineCode = 'CB-00-MAQ-00'
    const { body } = await api
      .get(ENGINE_ROUTES.baseWithMachine(machineCode))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(machineCode))
  })
  test('GET: all machine engines', async () => {
    const { body } = await api
      .get(ENGINE_ROUTES.baseWithMachine(FIRST_MACHINE_CODE))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(ALL_ENGINES)
  })
})

describe('Engines EndPoint => GET a engine by code', () => {
  test('GET: engine does not exist', async () => {
    const code = 'CB-00-MAQ-00-MOT-000'
    const { body } = await api
      .get(ENGINE_ROUTES.baseWithCode(code))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(engineNotFoundMessage(code))
  })
  test('GET: a engine by its code', async () => {
    const { body } = await api
      .get(ENGINE_ROUTES.baseWithCode(FIRST_ENGINE_CODE))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(FIRST_ENGINE)
  })
})

afterAll(async () => {
  await prisma.engine.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.area.deleteMany()
})
