import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import {
  ACTIVITY_ROUTES,
  FIRST_ACTIVITY_CODE,
  UPDATED_ACTIVITY_RESPONSE_DTO,
  UPDATE_ACTIVITY_DTO,
  activities,
} from './helpers'
import { api } from '../helpers/api'
import { activityNotFoundMessage } from '../../src/services/activity.service'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'
import { activityTypes } from '../activity-type/helpers'
import { frequencies } from '../frequency/helpers'

describe('Activities EndPoint => POST', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.criticality.createMany({ data: criticalities })
    await prisma.technicalDocumentation.createMany({
      data: technicalDocumentation,
    })
    await prisma.machine.createMany({ data: machines })

    await prisma.activityType.createMany({ data: activityTypes })
    await prisma.frequency.createMany({ data: frequencies })

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
      .expect(404)
    expect(body.message).toBe(activityNotFoundMessage(code))
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

    await prisma.activityType.deleteMany()
    await prisma.frequency.deleteMany()

    await prisma.machine.deleteMany()
    await prisma.technicalDocumentation.deleteMany()
    await prisma.criticality.deleteMany()
    await prisma.area.deleteMany()
  })
})
