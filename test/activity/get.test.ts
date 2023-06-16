import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import {
  ACTIVITY_ROUTES,
  activities,
  MACHINE_CODE,
  MACHINE_NAME,
  FILTERED_ACTIVITIES,
} from './helpers'
import { machineNotFoundMessage } from '../../src/services/machine.service'
import { api } from '../helpers/api'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'
import { frequencies } from '../frequency/helpers'
import { activityTypes } from '../activity-type/helpers'

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
      .get(ACTIVITY_ROUTES.baseWithMachine(MACHINE_CODE))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual({
      machineName: MACHINE_NAME,
      activities: FILTERED_ACTIVITIES,
    })
  })
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
