import { beforeEach, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import {
  ALL_MAINTENANCE_REQUESTS,
  MAINTENANCE_REQUEST_ROUTES,
  maintenanceRequests,
} from './helpers'
import { api } from '../helpers/api'

beforeEach(async () => {
  await prisma.maintenanceRequest.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.createMany({ data: machines })
  await prisma.maintenanceRequest.createMany({
    data: maintenanceRequests,
  })
})

describe('Maintenance Request EndPoint => GET', () => {
  test('GET: get all maintenace request that they have not been verified', async () => {
    const { body } = await api
      .get(MAINTENANCE_REQUEST_ROUTES.base)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(ALL_MAINTENANCE_REQUESTS)
  })
})
