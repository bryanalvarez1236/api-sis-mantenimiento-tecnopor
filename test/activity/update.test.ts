import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import {
  ACTIVITY_ROUTES,
  FIRST_ACTIVITY_CODE,
  UPDATED_ACTIVITY_RESPONSE_DTO,
  UPDATE_ACTIVITY_DTO,
  activities,
} from './helpers'
import { api } from '../helpers/api'
import {
  activityNotEditMessage,
  activityNotFoundMessage,
} from '../../src/services/activity.service'

describe('Activities EndPoint => POST', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.activity.createMany({ data: activities })
  })

  test('PUT: invalid body', async () => {
    await api
      .put(ACTIVITY_ROUTES.baseWithCode(FIRST_ACTIVITY_CODE))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('PUT: activity does not exist', async () => {
    const code = 'PRX000'
    const { body } = await api
      .put(ACTIVITY_ROUTES.baseWithCode(code))
      .set('Accept', 'application/json')
      .send(UPDATE_ACTIVITY_DTO)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(activityNotFoundMessage(code))
  })
  test('PUT: activity already delete', async () => {
    const code = 'PRX19'
    const { body } = await api
      .put(ACTIVITY_ROUTES.baseWithCode(code))
      .set('Accept', 'application/json')
      .send(UPDATE_ACTIVITY_DTO)
      .expect('Content-Type', /json/)
      .expect(405)
    expect(body.message).toBe(activityNotEditMessage(code))
  })
  test('PUT: update an activity by its code', async () => {
    const { body } = await api
      .put(ACTIVITY_ROUTES.baseWithCode(FIRST_ACTIVITY_CODE))
      .set('Accept', 'application/json')
      .send(UPDATE_ACTIVITY_DTO)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(UPDATED_ACTIVITY_RESPONSE_DTO)
  })

  afterAll(async () => {
    await prisma.activity.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
