import { beforeEach, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { MAINTENANCE_REQUEST_ROUTES, maintenanceRequests } from './helpers'
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

describe('Maintenance Request EndPoint => PATCH', () => {
  test('PATCH: invalid id', async () => {
    const { body } = await api
      .patch(MAINTENANCE_REQUEST_ROUTES.baseWithId('ID_INVALID'))
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe(
      'El id de la solicitud de mantenimiento debe ser un número'
    )
  })
  test('PATCH: maintenance request does not exist', async () => {
    const id = '0'
    const { body } = await api
      .patch(MAINTENANCE_REQUEST_ROUTES.baseWithId(id))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(
      `La solicitud de mantenimiento con el id '${id}' no existe`
    )
  })
  test('PATCH: maintenance request verified', async () => {
    const id = '1'
    const { body } = await api
      .patch(MAINTENANCE_REQUEST_ROUTES.baseWithId(id))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual({ id: +id })
  })
})
