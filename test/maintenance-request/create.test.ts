import { beforeEach, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { api } from '../helpers/api'
import {
  CREATED_MAINTENANCE_REQUEST_RESPONSE_DTO,
  CREATE_MAINTENANCE_REQUEST_DTO,
  MACHINE_CODE,
  MAINTENANCE_REQUEST_ROUTES,
} from './helpers'

beforeEach(async () => {
  await prisma.maintenanceRequest.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.createMany({ data: machines })
})

describe('Maintenance Request EndPoint => POST', () => {
  test('POST: invalid body', async () => {
    await api
      .post(MAINTENANCE_REQUEST_ROUTES.base(MACHINE_CODE))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('POST: machine does not exist', async () => {
    const machineCode = 'CB-00-PRX-00'
    const { body } = await api
      .post(MAINTENANCE_REQUEST_ROUTES.base(machineCode))
      .set('Accept', 'application/json')
      .send(CREATE_MAINTENANCE_REQUEST_DTO)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(
      `La máquina con el código '${machineCode}' no existe`
    )
  })
  test('POST: create a new maintenance request', async () => {
    const { body } = await api
      .post(MAINTENANCE_REQUEST_ROUTES.base(MACHINE_CODE))
      .set('Accept', 'application/json')
      .send(CREATE_MAINTENANCE_REQUEST_DTO)
      .expect('Content-Type', /json/)
      .expect(201)
    expect(body).toEqual({
      ...CREATED_MAINTENANCE_REQUEST_RESPONSE_DTO,
      id: body.id,
    })
  })
})
