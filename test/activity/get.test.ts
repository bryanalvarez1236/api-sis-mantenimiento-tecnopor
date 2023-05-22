import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import {
  FIRST_MACHINE,
  FIRST_MACHINE_CODE,
  areas,
  machines,
} from '../machine/helpers'
import {
  ACTIVITY_ROUTES,
  ALL_ACTIVITIES,
  FIRST_ACTIVITY_CODE,
  FIRST_ACTIVITY_RESPONSE_DTO,
  activities,
} from './helpers'
import { machineNotFoundMessage } from '../../src/services/machine.service'
import { api } from '../helpers/api'
import { activityNotFoundMessage } from '../../src/services/activity.service'

beforeAll(async () => {
  await prisma.area.createMany({ data: areas })
  await prisma.machine.createMany({ data: machines })
  await prisma.activity.createMany({ data: activities })
})

describe('Activities EndPoint => GET all machine activities', () => {
  test('GET: machine does not exist', async () => {
    const machineCode = 'CB-00-MAQ-00'
    const { body } = await api
      .get(ACTIVITY_ROUTES.baseWithMachine(machineCode))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(machineCode))
  })
  test('GET: all machine activities', async () => {
    const { body } = await api
      .get(ACTIVITY_ROUTES.baseWithMachine(FIRST_MACHINE_CODE))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual({
      machineName: FIRST_MACHINE.name,
      activities: ALL_ACTIVITIES,
    })
  })
})

describe.only('Activities EndPoint => GET an activity by code', () => {
  test('GET: activity does not exist', async () => {
    const code = 'PRX000'
    const { body } = await api
      .get(ACTIVITY_ROUTES.baseWithCode(code))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(activityNotFoundMessage(code))
  })
  test('GET: an activity by its code', async () => {
    const { body } = await api
      .get(ACTIVITY_ROUTES.baseWithCode(FIRST_ACTIVITY_CODE))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(FIRST_ACTIVITY_RESPONSE_DTO)
  })
})

afterAll(async () => {
  await prisma.activity.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.area.deleteMany()
})
