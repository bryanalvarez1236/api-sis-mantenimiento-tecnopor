import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import {
  ACTIVITY_ROUTES,
  CREATED_ACTIVITY_RESPONSE_DTO,
  CREATE_ACTIVITY_DTO,
  FIRST_ACTIVITY_CODE,
  activities,
} from './helpers'
import { api } from '../helpers/api'
import { machineNotFoundMessage } from '../../src/services/machine.service'
import { activityAlreadyExistsMessage } from '../../src/services/activity.service'

describe('Activities EndPoint => POST', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.activity.createMany({ data: activities })
  })

  test('POST: invalid body', async () => {
    await api
      .post(ACTIVITY_ROUTES.base)
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('POST: machine does not exist', async () => {
    const machineCode = 'CB-00-MAQ-00'
    const { body } = await api
      .post(ACTIVITY_ROUTES.base)
      .set('Accept', 'application/json')
      .send({ ...CREATE_ACTIVITY_DTO, machineCode })
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(machineCode))
  })
  test('POST: activity already exists', async () => {
    const code = FIRST_ACTIVITY_CODE
    const { body } = await api
      .post(ACTIVITY_ROUTES.base)
      .set('Accept', 'application/json')
      .send({ ...CREATE_ACTIVITY_DTO, code })
      .expect('Content-Type', /json/)
      .expect(409)
    expect(body.message).toBe(activityAlreadyExistsMessage(code))
  })
  test('POST: create a new activity', async () => {
    const { body } = await api
      .post(ACTIVITY_ROUTES.base)
      .set('Accept', 'application/json')
      .send(CREATE_ACTIVITY_DTO)
      .expect('Content-Type', /json/)
      .expect(201)
    expect(body).toEqual(CREATED_ACTIVITY_RESPONSE_DTO)
  })

  afterAll(async () => {
    await prisma.activity.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
