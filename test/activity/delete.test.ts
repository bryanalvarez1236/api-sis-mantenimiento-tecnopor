import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import {
  ACTIVITY_ROUTES,
  FIRST_ACTIVITY_CODE,
  FIRST_ACTIVITY_RESPONSE_DTO,
  activities,
} from './helpers'
import { api } from '../helpers/api'
import {
  activityAlreadyDeleteMessage,
  activityNotFoundMessage,
} from '../../src/services/activity.service'

describe('Activities EndPoint => DELETE', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.activity.createMany({ data: activities })
  })

  test('DELETE: activity does not exist', async () => {
    const code = 'PRX000'
    const { body } = await api
      .delete(ACTIVITY_ROUTES.baseWithCode(code))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(activityNotFoundMessage(code))
  })
  test('DELETE: activity already delete', async () => {
    const code = 'PRX19'
    const { body } = await api
      .delete(ACTIVITY_ROUTES.baseWithCode(code))
      .expect('Content-Type', /json/)
      .expect(406)
    expect(body.message).toBe(activityAlreadyDeleteMessage(code))
  })
  test('DELETE: delete an activity by its code', async () => {
    const { body } = await api
      .delete(ACTIVITY_ROUTES.baseWithCode(FIRST_ACTIVITY_CODE))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(FIRST_ACTIVITY_RESPONSE_DTO)
  })

  afterAll(async () => {
    await prisma.activity.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
