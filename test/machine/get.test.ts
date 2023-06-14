import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import {
  ALL_MACHINES,
  FIRST_MACHINE_CODE,
  FIRST_MACHINE_RESPONSE_DTO,
  MACHINE_ROUTES,
  machines,
} from './helpers'
import { api } from '../helpers/api'
import { machineNotFoundMessage } from '../../src/services/machine.service'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'
import { boots } from '../boot/helpers'
import { engines } from '../engine/helpers'

beforeAll(async () => {
  await prisma.area.createMany({ data: areas })
  await prisma.criticality.createMany({ data: criticalities })
  await prisma.technicalDocumentation.createMany({
    data: technicalDocumentation,
  })
  await prisma.boot.createMany({ data: boots })

  await prisma.machine.createMany({ data: machines })
  await prisma.engine.createMany({ data: engines })
})

describe('Machines EndPoint => GET all machines', () => {
  test('GET: all machines', async () => {
    const { body } = await api
      .get(MACHINE_ROUTES.base)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(ALL_MACHINES)
  })
})

describe('Machines EndPoint => GET a machine by code', () => {
  test('GET: machine does not exist', async () => {
    const code = 'CB-00-MAQ-00'
    const { body } = await api
      .get(MACHINE_ROUTES.baseWithCode(code))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(code))
  })
  test('GET: a machine by its code', async () => {
    const { body } = await api
      .get(MACHINE_ROUTES.baseWithCode(FIRST_MACHINE_CODE))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(FIRST_MACHINE_RESPONSE_DTO)
  })
})

afterAll(async () => {
  await prisma.engine.deleteMany()
  await prisma.machine.deleteMany()

  await prisma.boot.deleteMany()
  await prisma.technicalDocumentation.deleteMany()
  await prisma.criticality.deleteMany()
  await prisma.area.deleteMany()
})
